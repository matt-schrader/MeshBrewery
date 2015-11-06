Tasks = new Mongo.Collection("tasks");

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
