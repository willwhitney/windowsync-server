(function() {
  var http, port, socketio, start, url, _ref;
  http = require("http");
  url = require("url");
  socketio = require("socket.io");
  port = (_ref = process.env.PORT) != null ? _ref : 8888;
  start = function(route, handleSocket, handle) {
    var app, io, onRequest;
    onRequest = function(request, response) {
      var pathname;
      pathname = url.parse(request.url).pathname;
      console.log("request for " + pathname + " received.");
      return route(handle, pathname, response);
    };
    app = http.createServer(onRequest);
    io = socketio.listen(app);
    io.configure(function() {
      io.set("transports", ["xhr-polling"]);
      return io.set("polling duration", 10);
    });
    app.listen(port);
    console.log("server started");
    return io.sockets.on('connection', function(socket) {
      return handleSocket(socket);
    });
  };
  exports.start = start;
}).call(this);
