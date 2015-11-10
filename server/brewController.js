Fiber = Npm.require('fibers');

//or whatever your device is connected to

var serialPort = new SerialPort.SerialPort("/dev/ttyUSB0", {
    baudrate: 115200,
    parser: SerialPort.parsers.readline('\r\n')
});
serialPort.on('open', function() {
    console.log('Port open');
});

var commands = {
  'READT': function(args) {
    var reading = {
      nodeId: args[0],
      address: args[1],
      temperature: args[2],
      deviceTargetTemperature: args[3]
    }

    Fiber(function() { logSensorReading(reading) } ).run();
  }
}

//receive data
serialPort.on('data', function(data) {
    console.log('message ' + data);

    var args = data.split(' ');
    if(commands[args[1]]) {
      commands[args[1]]('arguments', args.slice(2));
    }
});

//send data
var sendToSerialPort = function(message) {
    serialPort.write(message);
};
