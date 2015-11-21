#include "RF24.h"
#include "RF24Network.h"
#include "RF24Mesh.h"
#include <SPI.h>

RF24 radio(9,10);
RF24Network network(radio);
RF24Mesh mesh(radio,network);

void InitMesh(uint8_t nodeID) {
  mesh.setNodeID(nodeID);
  mesh.begin();
}

void UpdateMesh() {
  mesh.update();
}

void SendMessage(char* data, int length) {
  // If a write fails, check connectivity to the mesh network
  if (!mesh.checkConnection()) {
    //refresh the network address
    mesh.renewAddress(); 
  }

  if(!mesh.write(data, 'M', length)){
    Serial.println("Send fail, Test OK");
  }
}

void ReadMessage(char* data, boolean* read) {
  *read = false;
  if(network.available()){
    Serial.println("doing the reading");
    RF24NetworkHeader header;
    size_t dataSize = network.peek(header);
    
    int fromNodeID = mesh.getNodeID(header.from_node);
    
    switch(header.type){
      case 'M': 
        network.read(header, data, dataSize);
        *read = true;
        Serial.print(fromNodeID);
        Serial.print(" ");
        Serial.println(data);
        break;
      default: 
        network.read(header,0,0); 
        Serial.println(header.type);
        break;
    }
  }
}

