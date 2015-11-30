var {
  Card,
  CardHeader,
  CardText,
  Avatar,
  Toggle,
  TextField,
  RaisedButton
} = MUI;

var { Colors } = MUI.Styles;

DeviceView = React.createClass({
  getInitialState() {
    return {
      targetTemperature: this.props.device.targetTemperature,
      boilOn: this.props.device.boilOn,
      deviceToggleLabel: 'Activate Device',
      activated: this.props.device.targetTemperature > 0
    }
  },

  renderSensor() {
    if(this.props.device.sensors) {
      return this.props.device.sensors.map((sensor) => {
        return <div key={sensor._id}>{sensor.temperature}</div>;
      });
    }
  },

  handleSave() {
    console.log("Doing the saving stuff");
    createOrUpdateDevice({
      nodeId: this.props.device.nodeId,
      targetTemperature: this.state.targetTemperature,
      boilOn: this.state.boilOn
    })
  },

  toggleBoilMode(event) {
    this.setState({boilOn: !this.state.boilOn});
  },

  handleTargetTemperatureChange(event) {
    var temperature;
    if(event.target.value) {
      temperature = parseInt(event.target.value);
    }
    this.setState({targetTemperature: temperature});
  },

  onActivateToggled: function(event, toggled) {
    this.setState({
      activated: toggled
    });

    if(!toggled) {
      this.setState({
        targetTemperature: 0,
        boilOn: false
      })
    }
  },

  render() {
    var deviceStateColor = this.state.activated ? Colors.blue500 : Colors.grey400;

    return (
      <Card>
        <CardHeader
          title={this.props.device.currentTemperature}
          avatar={<Avatar style={{backgroundColor: deviceStateColor}}>{this.props.device.nodeId}</Avatar>}>
        </CardHeader>

        <CardText>
          <Toggle
            name="deviceActivated"
            value="deviceActivated"
            label={this.state.deviceToggleLabel}
            style={{width: 200}}
            defaultToggled={this.state.activated}
            onToggle={this.onActivateToggled}/>

          <Toggle
            name="boilOn"
            value="boilOn"
            label="Boil?"
            style={{width: 200}}
            defaultToggled={this.state.boilOn}
            onToggle={this.toggleBoilMode} />

          <TextField
            hintText="Enter Target Temperature"
            floatingLabelText="Target Temperature"
            onChange={this.handleTargetTemperatureChange}
            value={this.state.targetTemperature} />

          <RaisedButton
            label="Save"
            style={{marginLeft: 16}}
            primary={true}
            onClick={this.handleSave} />
        </CardText>
      </Card>
    );
  }
});
