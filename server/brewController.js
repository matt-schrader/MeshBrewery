Fiber = Npm.require('fibers');

function lpad(str, padString, length) {
    while (str.length < length)
        str = padString + str;
    return str;
}

//or whatever your device is connected to
var open = false,
    serialPort;

//send data
var sendToSerialPort = function(message) {
  if(!serialPort || !serialPort.isOpen()) {
    console.log('Cannot send message (serial port closed): ' + message);
    return;
  }

  console.log("Sending message: " + message);
  serialPort.write(message);
};

var commands = {
  'READT': function(args) {
    var nodeId = args[0];

    var reading = {
      nodeId: nodeId,
      address: args[1],
      temperature: args[2]
    };

    var targetTemperatureSlot = args[3];
    if(targetTemperatureSlot === 'BOIL') {
      reading.deviceBoilOn = true;
    } else {
      reading.deviceTargetTemperature = targetTemperatureSlot;
    }

    Fiber(function() {
      var nodeId = reading.nodeId;

      logSensorReading(reading);

      var device = Devices.findOne({nodeId: nodeId});
      if(device) {
        var targetTemperature = device.targetTemperature;
        if(!targetTemperature) {
          targetTemperature = 0;
        }

        var nodeId = device.nodeId;
        lpad(nodeId, "0", 2);

        var command = "SETT " + nodeId + " ";

        if(device.boilOn && device.boilOn !== device.deviceBoilOn) {
          sendToSerialPort(command + "BOIL;");
        } else if(targetTemperature !== device.deviceTargetTemperature && !device.boilOn) {
          var temp = device.targetTemperature || 0;
          sendToSerialPort(command + device.targetTemperature + ";");
        }
      } else {
        console.log("ERROR: could not find device to sync target temperature settings: {nodeId: " + nodeId + "}");
      }
    }).run();
  }
}

function maintainSerialConnection() {
  if(!serialPort || !serialPort.isOpen()) {

    serialPort = new SerialPort.SerialPort("/dev/ttyUSB0", {
        baudrate: 115200,
        parser: SerialPort.parsers.readline('\r\n')
    }, false); //don't open immediately

    serialPort.open(function (error) {
      if ( error ) {
        console.log('failed to open serial port: '+error);
        setTimeout(maintainSerialConnection, 1000);
      } else {
        console.log('serial port open');
        //receive data
        serialPort.on('data', function(data) {
            console.log('message ' + data);

            var args = data.split(' ');
            if(commands[args[1]]) {
              commands[args[1]](args.slice(2));
            }
        });
      }
    });
  }
}
maintainSerialConnection();
