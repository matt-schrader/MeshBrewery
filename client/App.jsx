var {
    AppCanvas,
    AppBar,
    Styles
    } = MUI;

// App component - represents the whole app
App = React.createClass({

  // This mixin makes the getMeteorData method work
  mixins: [ReactMeteorData],

  getInitialState() {
    return {
      hideCompleted: false,
      menuItem: 'Devices'
    };
  },

  // Loads items from the Tasks collection and puts them on this.data.tasks
  getMeteorData() {
    let query = {};

    if (this.state.hideCompleted) {
      // If hide completed is checked, filter tasks
      query = {checked: {$ne: true}};
    }

    return {
      tasks: Tasks.find(query, {sort: {createdAt: -1}}).fetch(),
      incompleteCount: Tasks.find({checked: {$ne: true}}).count(),
      devices: Devices.find({}).fetch()
    };
  },

  renderTasks() {
    // Get tasks from this.data.tasks
    return this.data.tasks.map((task) => {
      return <Task key={task._id} task={task} />;
    });
  },

  handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
    var text = React.findDOMNode(this.refs.textInput).value.trim();

    Tasks.insert({
      text: text,
      createdAt: new Date() // current time
    });

    // Clear form
    React.findDOMNode(this.refs.textInput).value = "";
  },

  toggleHideCompleted() {
    this.setState({
      hideCompleted: ! this.state.hideCompleted
    });
  },

  render() {
    if(this.state.menuItem === 'Devices') {
      return (<AppCanvas>
                <AppBar title="Brewery" />
                <div style={{padding: '80px'}}><DevicesView /></div>
              </AppCanvas>);
    } else {
      return (
        <div className="container">
          <header>
            <h1>Todo List ({this.data.incompleteCount})</h1>

            <label className="hide-completed">
              <input
                type="checkbox"
                readOnly={true}
                checked={this.state.hideCompleted}
                onClick={this.toggleHideCompleted} />
              Hide Completed Tasks
            </label>

            <form className="new-task" onSubmit={this.handleSubmit} >
              <input
                type="text"
                ref="textInput"
                placeholder="Type to add new tasks" />
            </form>
          </header>

          <ul>
            {this.renderTasks()}
          </ul>
        </div>
      );
    }
  }
});
