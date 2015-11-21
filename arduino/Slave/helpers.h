#include "Arduino.h"

struct Temp {
  byte addr[8];
  int celsius;
  bool didRead = false;
};
