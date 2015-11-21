#define RelayPin 6

//Define Variables we'll be connecting to
double Input, Output, Setpoint;

//Specify the links and initial tuning parameters
PID myPID(&Input, &Output, &Setpoint, 10000, 500, 100, DIRECT);

int WindowSize = 5000;
int BoilWindowSize = 2000;
unsigned long windowStartTime = 0;
unsigned long windowEndTime = 0;
unsigned long killTime = 0;
bool boilingMode = false;

Temp reading;

//Really idiotic function because I have no idea how to do it better right now and I just wanted something to work
bool isBoilCmd(char* cmd) {
  int x;
  for(x = 0; x < 4; x++) {
    if(x == 0 && cmd[x] != 'B') {
      return false;
    } else if(x == 1 && cmd[x] != 'O') {
      return false;
    } else if(x == 2 && cmd[x] != 'I') {
      return false;
    } else if(x == 4 && cmd[x] != 'L') {
      return false;
    }
  }
  return true;
}

bool isReverseDirection(char* dir) {
  if(strlen(dir) > 0) {
    int dirInt = cmdStr2Num(dir, 10);
    if(dirInt == 1) {
      return true;
    }
  }

  return false;
}

void setTargetTemp(int arg_cnt, char **args) {
  if(isReverseDirection(args[2])) {
    Serial.println("Reversing pid direction");
    myPID.SetControllerDirection(REVERSE);
  } else {
    Serial.println("Setting direction to forward");
    myPID.SetControllerDirection(DIRECT);
  }
  
  if(isBoilCmd(args[1])) {
    Serial.println("TURNING ON BOIL MODE");
    boilingMode = true;
  } else {
    Serial.println("TURNING OFF BOIL MODE");
    boilingMode = false;
    Setpoint = cmdStr2Num(args[1], 10);
  }
}

double getSetpoint() {
  return Setpoint;
}

double isBoilMode() {
  return boilingMode;
}

void doPid(void) {
  if (Setpoint > 0 || boilingMode) {
    Input = reading.celsius;

    unsigned long now = millis();
    if (windowStartTime == 0 || now > windowEndTime) {
      if(boilingMode) {
        windowStartTime = now;
        windowEndTime = now + BoilWindowSize;
        
        if(Input < 9910) {
          //if it's not close to boiling then keep it on permanently
          killTime = windowEndTime + 1000; //add a second to the end time just to make sure it isn't switched off
        } else {
          //if we are in boil mode then run a phase cycle keeping the burner on for 60% of the time
          killTime = now + (BoilWindowSize * 0.6);
        }
      } else {
        myPID.Compute();
        windowStartTime = now;
        windowEndTime = now + WindowSize;
        killTime = now + Output;
      }
    }
    
    if (windowStartTime <= now && killTime > now) {
      digitalWrite(RelayPin, HIGH);
    } else if (now < windowEndTime) {
      digitalWrite(RelayPin, LOW);
    }
  } else {
    digitalWrite(RelayPin, LOW);
  }
}
