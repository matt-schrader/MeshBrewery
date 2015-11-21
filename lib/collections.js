Tasks = new Mongo.Collection("tasks");

//Brewery
Devices = new Mongo.Collection("devices");
Sensors = new Mongo.Collection("sensors");
Readings = new Mongo.Collection("readings");

createOrUpdateDevice = function(device) {
  if(!device.nodeId) {
    console.log("ERROR: node id is required for device.", device);
  }

  var existingDevice = Devices.findOne({nodeId: device.nodeId});
  console.log("existing device", existingDevice);
  if(existingDevice) {
    console.log('Updating device', device);
    Devices.update({_id: existingDevice._id}, {$set: device});
    return Devices.findOne({nodeId: device.nodeId});
  } else {
    console.log('Creating device', device);
    Devices.insert(device);
    return Devices.findOne({nodeId: device.nodeId});
  }
}

function createOrUpdateSensor(sensor) {
  if(!sensor.address) {
    console.log("ERROR: address is required for sensor.", sensor);
  }

  var existingSensor = Sensors.findOne({address: sensor.address});
  if(existingSensor) {
    console.log('Updating sensor', sensor);
    Sensors.update({_id: existingSensor._id}, {$set: sensor});
    return Sensors.findOne({address: sensor.address});
  } else {
    console.log('Creating sensor', sensor);
    Sensors.insert(sensor);
    return Sensors.findOne({address: sensor.address});
  }
}

function getNumber(string) {
  var parsedNumber = parseInt(string), number = 0;

  if(parsedNumber) {
    number = parsedNumber;
  }

  return number;
}

logSensorReading = function(reading) {

  var deviceMeta = {
    nodeId: reading.nodeId,
    deviceTargetTemperature: getNumber(reading.deviceTargetTemperature),
    deviceBoilOn: reading.deviceBoilOn
  };

  var device = createOrUpdateDevice(deviceMeta);

  var sensorMeta = {
    deviceId: device._id,
    address: reading.address,
    temperature: getNumber(reading.temperature)
  };

  var sensor = createOrUpdateSensor(sensorMeta);

  var readingMeta = {
    sensorId: sensor._id,
    temperature: getNumber(reading.temperature)
  };
  Readings.insert(readingMeta);
}
