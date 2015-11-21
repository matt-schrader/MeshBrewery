Fiber = Npm.require('fibers');

function lpad(str, padString, length) {
    while (str.length < length)
        str = padString + str;
    return str;
}

//or whatever your device is connected to

var serialPort = new SerialPort.SerialPort("/dev/ttyUSB0", {
    baudrate: 115200,
    parser: SerialPort.parsers.readline('\r\n')
});
serialPort.on('open', function() {
    console.log('Port open');
});

//send data
var sendToSerialPort = function(message) {
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
      console.log("ITTTTTTTT {nodeId: " + nodeId + "}");
      console.log(reading.nodeId);

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

        if(device.boilOn) {
          if(device.boilOn !== device.deviceBoilOn) {
            sendToSerialPort(command + "BOIL;");
          }
        } else if(targetTemperature !== device.deviceTargetTemperature) {
          sendToSerialPort(command + device.targetTemperature + ";");
        }
      } else {
        console.log("ERROR: could not find device to sync target temperature settings: {nodeId: " + nodeId + "}");
      }
    }).run();
  }
}

//receive data
serialPort.on('data', function(data) {
    console.log('message ' + data);

    var args = data.split(' ');
    if(commands[args[1]]) {
      commands[args[1]](args.slice(2));
    }
});
