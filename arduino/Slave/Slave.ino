#include <PID_v1.h>

#include "Cmdr.h"

#include "helpers.h"
#include "temperature.h"
#include "OneWire.h"

#include "RF24.h"
#include "RF24Network.h"
#include "RF24Mesh.h"
#include <SPI.h>
#include "rf.h"

#include "pidLoop.h"

#define nodeID 1
#define maxValue 64

char dataStr[maxValue];
char inputStr[maxValue];
boolean readInput = false;

void setup(void) {
  Serial.begin(115200);

  pinMode(RelayPin, OUTPUT);

  InitMesh(nodeID);

  cmdInit(&Serial);
  cmdAdd("SETT", setTargetTemp);

  windowStartTime = millis();

  //tell the PID to range between 0 and the full window size
  myPID.SetOutputLimits(0, WindowSize);

  //turn the PID on
  myPID.SetMode(AUTOMATIC);

  memset(dataStr, '\0', maxValue);
  memset(dataStr, '\0', readInput);
}

void intToString(int value, char* r, int start = 0, int strLen = -1) {
  int temp = value;
  int place = 10;
  int i;
  for (i = start; i < start + strLen; i++) {
    int d = (temp % place);
    if (place > 10 && d > 0) {
      d = d / (place / 10);
    }

    temp -= d;
    place *= 10;
    
    // working backwards so add 4 to start and subtract index
    // char is character value of '0' or 48 + this digit
    if(d >= 0) {
      r[(start + (strLen - 1)) - (i - start)] = char(48 + d);
    } else {
      r[(start + (strLen - 1)) - (i - start)] = char(48);
    }
  }
}

void loop(void) {
  UpdateMesh();

  ReadMessage(inputStr, &readInput);
  if (readInput) {
    cmdParse(inputStr);
  }

  ReadTemp(reading);

  if (reading.didRead) {
    doPid();

    byte i;
    int addrSize = 8;
    int startNodeId = 6;

    strcpy(dataStr, "READT ");

    intToString(nodeID, dataStr, startNodeId, 2);
    dataStr[startNodeId + 2] = ' ';

    int startAddr = startNodeId + 3;;
    byte* addr = reading.addr;
    for (i = 0; i < addrSize; i++) {
      String hexString = String(addr[i], HEX);
      hexString.toUpperCase();

      int bytePos = startAddr + i * 2;
      if (hexString.length() == 1) {
        dataStr[bytePos] = '0';
        dataStr[bytePos + 1] = hexString.charAt(0);
      } else {
        dataStr[bytePos] = hexString.charAt(0);
        dataStr[bytePos + 1] = hexString.charAt(1);
      }
    }
    dataStr[startAddr + (addrSize * 2)] = ' ';

    int startTemp = startAddr + (addrSize * 2) + 1;
    intToString(reading.celsius, dataStr, startTemp, 5);
    dataStr[startTemp + 5] = ' ';

    int startTargetTemp = startTemp + 5 + 1;
    if(!isBoilMode()) {
      intToString(getSetpoint(), dataStr, startTargetTemp, 5);
    } else {
      dataStr[startTargetTemp + 0] = 'B';
      dataStr[startTargetTemp + 1] = 'O';
      dataStr[startTargetTemp + 2] = 'I';
      dataStr[startTargetTemp + 3] = 'L';
      dataStr[startTargetTemp + 4] = '\0';
    }

    UpdateMesh();
    SendMessage(dataStr, maxValue);

    //    clearArray();
  }

  reading = {};
}

