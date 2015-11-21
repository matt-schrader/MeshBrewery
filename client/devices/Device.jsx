var {
  Card,
  CardHeader,
  CardText,
  Avatar,
  Toggle,
  TextField
} = MUI;

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
        targetTemperature: 0
      })
    }
  },

  renderTargetTemperature() {
    var device = this.props.device;
    if(device.deviceTargetTemperature && !device.targetTemperature) {
      return <div class="error">The device has a target temperature but the system thinks it should be off, something might not have synced up properly</div>
    }

    return (<div><br />
        <input type="checkbox" name="boil" checked={this.state.boilOn} onClick={this.toggleBoilMode} /><label for="boil">Boil?</label><br />
        {device.boilMode}

        <label for="targetTemperature">Target Temperature</label><br />
        <input name="targetTemperature" type="text" value={this.state.targetTemperature} onChange={this.handleTargetTemperatureChange} /><br />
        <button onClick={this.handleSave}>Save</button>
      </div>);
  },

  render() {
    return (
      <Card>
        <CardHeader
          title={this.props.device.currentTemperature}
          avatar={<Avatar>{this.props.device.nodeId}</Avatar>}>
        </CardHeader>
        <CardText>
          <Toggle
            name="toggleName1"
            value="toggleValue1"
            label={this.state.deviceToggleLabel}
            style={{width: 300}}
            defaultToggled={this.state.activated}
            onToggle={this.onActivateToggled}/>

          <TextField
            hintText="Enter Target Temperature"
            floatingLabelText="Target Temperature"
            value={this.state.targetTemperature} />
        </CardText>
      </Card>
      // <li>
      //   <div className="node-identifier">{this.props.device.nodeId}</div>
      //   {this.renderSensor()}
      //   {this.renderTargetTemperature()}
      // </li>
    );
  }
});
