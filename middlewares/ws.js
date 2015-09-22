var config = require('config');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: config.get('ws.port')});

var clients = [];

wss.on('connection', function connection(client) {
  client.on('message', function(orderId){
    console.log('WS Client registered for ' + orderId);
    client.orderId = orderId;
  });
  clients.push(client);
});

module.exports = function(req, res, next) {
  req.wsUpdate = function(orderId, type, data) {
    console.log('Update requested for ' + orderId);
    var participants = clients.filter(function(client){
      return '' + client.orderId === '' + orderId;
    });

<<<<<<< HEAD
    participants.forEach(function(client) {
=======
    participants.forEach(function() {
>>>>>>> origin/wsimpl
      client.send(JSON.stringify({
        type: type,
        data: data
      }));
    });
  };

  req.wsClose = function(orderId) {
    console.log('Close requested for ' + orderId);

    clients = clients.filter(function(client){
      return '' + client.orderId !== '' + orderId;
    });
  };

  next();
};
