Tasks = new Mongo.Collection("tasks");
Devices = new Mongo.Collection("devices");

if (Meteor.isServer) {
  var Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
  });

  Api.addCollection(Tasks);

  Meteor.startup(function () {
    // code to run on server at startup
  });
}
