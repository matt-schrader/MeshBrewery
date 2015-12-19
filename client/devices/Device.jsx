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
      enteredTargetTemperature: this.convertToFahr(this.props.device.targetTemperature),
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

    createOrUpdateDevice({
      nodeId: this.props.device.nodeId,
      targetTemperature: this.convertToCelsius(this.state.enteredTargetTemperature),
      boilOn: this.state.boilOn
    });

    this.setState({
      enteredTargetTemperature: this.convertToFahr(this.state.targetTemperature)
    })
  },

  convertToFahr(celsius) {
    if(isNaN(celsius)) {
      return undefined;
    }
    return Math.round(((celsius / 100) * 1.8 + 32) * 10) / 10;
  },

  convertToCelsius(fahr) {
    if(isNaN(fahr)) {
      return undefined;
    }
    return Math.floor(((fahr - 32) * 5/9) * 100);
  },

  getTargetTemperature() {
    return this.convertToFahr(this.state.targetTemperature);
  },

  getEnteredTargetTemperature() {
    return this.state.enteredTargetTemperature;
  },

  getCurrentTemperature() {
    return this.convertToFahr(this.props.device.currentTemperature);
  },

  toggleBoilMode(event) {
    this.setState({boilOn: !this.state.boilOn});
  },

  handleTargetTemperatureChange(event) {
    var temperature;
    if(event.target.value) {
      temperature = event.target.value;
    }
    this.setState({enteredTargetTemperature: temperature});
  },

  onActivateToggled: function(event, toggled) {
    this.setState({
      activated: toggled
    });

    if(!toggled) {
      this.setState({
        enteredTargetTemperature: undefined,
        boilOn: false
      })
    }
  },

  render() {
    var deviceStateColor = this.state.activated ? Colors.blue500 : Colors.grey400;

    return (
      <Card>
        <CardHeader
          title={this.getCurrentTemperature()}
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
            value={this.getEnteredTargetTemperature()} />

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
