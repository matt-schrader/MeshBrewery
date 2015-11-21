#ifndef rf_h
#define rf_h

void InitMesh(uint8_t nodeID);
void UpdateMesh();
void SendMessage(char* data, int length);
void ReadMessage(char* data, boolean*);

#endif
