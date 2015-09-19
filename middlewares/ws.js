var config = require('config');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: config.get('ws.port')});

var clients = [];

wss.on('connection', function connection(ws) {
  ws.on('message', function(code){
    console.log('WS Client registered for ' + code);
    ws.code = code;
  });
  clients.push(client);
});

module.exports = function(req, res, next) {
  req.wsUpdate = function(code) {
    console.log('Update requested for ' + code);
    var participants = clients.filter(function(client){
      return '' + client.code === '' + code;
    });

    participants.forEach(function() {
      client.send('update');
    });
  };

  req.wsClose = function(code) {
    console.log('Close requested for ' + code);

    clients = clients.filter(function(client){
      return '' + client.code !== '' + code;
    });
  };

  next();
};
