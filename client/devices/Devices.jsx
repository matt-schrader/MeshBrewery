var {
    Card
    } = MUI;

DevicesView = React.createClass({
  // This mixin makes the getMeteorData method work
  mixins: [ReactMeteorData],

  getInitialState() {
    return {

    };
  },

  // Loads items from the Tasks collection and puts them on this.data.tasks
  getMeteorData() {
    let query = {};

    var data = {
      devices: Devices.find(query).fetch()
    };

    for (deviceIndex in data.devices) {
      var device = data.devices[0];
      device.sensors = Sensors.find({deviceId: device._id}).fetch();
    }

    return data;
  },

  renderDevices() {
    // Get tasks from this.data.tasks
    return this.data.devices.map((device) => {
      return <DeviceView key={device._id} device={device} />;
    });
  },

  render() {
    return <div>{this.renderDevices()}</div>;
  }
});
