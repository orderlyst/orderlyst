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
  req.wsUpdate = function(orderId) {
    console.log('Update requested for ' + orderId);
    var participants = clients.filter(function(client){
      return '' + client.orderId === '' + orderId;
    });

    participants.forEach(function() {
      client.send('update');
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
