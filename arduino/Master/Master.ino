#include "RF24Network.h"
#include "RF24.h"
#include "RF24Mesh.h"
#include <SPI.h>

#define maxValue 64

#include "Cmdr.h"

/***** Configure the chosen CE,CS pins *****/
RF24 radio(9,10);
RF24Network network(radio);
RF24Mesh mesh(radio,network);

char fromServer[maxValue];
uint32_t fromServerPosition = 0;

char fromNode[maxValue];

void setup() {
  Serial.begin(115200);
  
  // Setup the mesh
  mesh.setNodeID(0);
  mesh.begin();

  memset(fromServer, '\0', maxValue);
  memset(fromNode, '\0', maxValue);

  cmdInit(&Serial);
  cmdAdd("SETT", setTargetTemp);
  
  Serial.println("Done setting up master node");
}

void setTargetTemp(int arg_cnt, char **args) {
  Serial.print("processing command with ");
  Serial.print(arg_cnt);
  Serial.println(" args");
  if(arg_cnt == 3 || arg_cnt == 4) {
    
    copyToString(args[0], fromServer, fromServerPosition);
    fromServerPosition += strlen(args[0]);
    fromServer[fromServerPosition] = ' ';
    fromServerPosition++;

    copyToString(args[2], fromServer, fromServerPosition);
    fromServerPosition += strlen(args[2]);

    Serial.print("checking argument 3: ");
    Serial.println(args[3]);
    if(arg_cnt == 4 && strlen(args[3]) > 0) {
      fromServer[fromServerPosition] = ' ';
      fromServerPosition++;

      copyToString(args[3], fromServer, fromServerPosition);
      fromServerPosition += strlen(args[3]);
    }
    
    fromServer[fromServerPosition] = ';';
    fromServerPosition++;
    fromServer[fromServerPosition] = '\0';
    fromServerPosition++;

    int node = cmdStr2Num(args[1], 10);

    Serial.print("Message came for node in:");
    Serial.println(node);
    Serial.println(fromServer);

    for(int x = 0; x < 5; x++) {
      //TODO: this always sends to node 1
      if(!mesh.write(fromServer,'M', sizeof(fromServer), node)){
        Serial.println("Send failed");
      } else {
        Serial.println("Send OK");
        break;
      }
      delay(100);
    }
    
    for(int x = 0; x < maxValue; x++) {
      fromServer[x] = '\0';
    }
    fromServerPosition = 0;
  }
}

bool copyToString(char* arg, char* string, int pos) {
  if(strlen(arg) + pos > maxValue) {
    return false;
  }
  
  for(int x = 0; x < strlen(arg); x++) {
    string[pos + x] = arg[x];
  }
  
  return true;
}

void loop() {   
  cmdPoll(); 

  // Call mesh.update to keep the network updated
  mesh.update();
  
  // In addition, keep the 'DHCP service' running on the master node so addresses will
  // be assigned to the sensor nodes
  mesh.DHCP();
  
  // Check for incoming data from the sensors
  if(network.available()){
    RF24NetworkHeader header;
    network.peek(header);
    
    int fromNodeID = mesh.getNodeID(header.from_node);
    
    switch(header.type){
      // Display the incoming millis() values from the sensor nodes
      case 'M': 
        network.read(header, fromNode, sizeof(fromNode));
        Serial.print(fromNodeID);
        Serial.print(" ");
        Serial.println(fromNode);
        fromNode[0] = '\0';
        break;
      default: 
        network.read(header,0,0); 
        Serial.println(header.type);
        break;
    }
  }

//  // print the string when a semicolon arrives:
//  if (stringComplete) {
//    int x;
//    Serial.print("Sending: ");
//    Serial.println(fromServer); 
//    for(x = 0; x < 5; x++) {
//      //TODO: this always sends to node 1
//      if(!mesh.write(fromServer,'M', sizeof(fromServer), 1)){
//        Serial.println("Send failed");
//      } else {
//        Serial.println("Send OK");
//        break;
//      }
//      delay(100);
//    }
//    fromServer[0] = '\0';
//    stringComplete = false;
//  }
}

/*
  SerialEvent occurs whenever a new data comes in the
 hardware serial RX.  This routine is run between each
 time loop() runs, so using delay inside loop can delay
 response.  Multiple bytes of data may be available.
 */
//void serialEvent() {
//  while (Serial.available()) {
//    // get the new byte:
//    char inChar = (char)Serial.read();
//    
//    // add it to the inputString:
//    fromServer[fromServerPosition] = inChar;
//    fromServerPosition++;
//    
//    // if the incoming character is a newline, set a flag
//    // so the main loop can do something about it:
//    if (inChar == ';') {
//      fromServer[fromServerPosition] = '\0';
//      stringComplete = true;
//      fromServerPosition = 0;
//    } 
//  }
//}


