(function() {
  var guidGenerator, handleSocket, redclient, redis;
  redis = require("redis");
  redclient = redis.createClient("9217", "stingfish.redistogo.com");
  redclient.auth("48304f84d573067d96fe7dc8662846fd");
  redclient.on("error", function(err) {
    return console.log("redis error: " + err);
  });
  guidGenerator = function() {
    var S4;
    S4 = function() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
  };
  redclient.flushall(redis.print);
  /*
  redclient.rpush(WINDOWID, "test1", redis.print)
  redclient.rpush(WINDOWID, "test2", redis.print)
  redclient.rpush(WINDOWID, "test3", redis.print)
  redclient.lindex(WINDOWID, 1, (error, result) ->
      console.log "error: #{error}"
      console.log "result: #{result}"
  )
  */
  handleSocket = function(socket) {
    socket.on('makeWindowId', function() {
      console.log("made new windowId");
      return socket.emit('windowId', {
        'windowId': guidGenerator()
      });
    });
    socket.on('tabAdded', function(tab) {
      var id;
      console.log("tab added:");
      console.log(tab);
      console.log("other tabs:");
      redclient.lrange(tab['windowId'], 0, 10000, function(err, res) {
        return console.log(res);
      });
      id = tab['id'];
      redclient.get(tab['windowId'] + ":" + id, function(err, res) {
        if (res != null) {
          id = guidGenerator();
        }
        return redclient.set(tab['windowId'] + ":" + id, JSON.stringify(tab), redis.print);
      });
      console.log("tab index: " + tab['index']);
      redclient.lindex(tab['windowId'], tab['index'], function(error, result) {
        console.log("currently at that index: " + result);
        if (result != null) {
          console.log("inserting before result: " + result);
          return redclient.linsert(tab['windowId'], 'BEFORE', result, id, redis.print);
        } else {
          console.log("inserting at the end.");
          return redclient.rpush(tab['windowId'], id, redis.print);
        }
      });
      socket.emit('tabId', {
        clientId: tab['id'],
        serverId: id,
        windowId: tab['windowId']
      });
      return socket.broadcast.emit('tabAdded', tab);
    });
    socket.on('tabRemoved', function(tab) {
      console.log("tab removed:");
      console.log(tab);
      redclient.del(tab['windowId'] + ":" + tab['id'], redis.print);
      redclient.lrem(tab['windowId'], 1, tab['id'], redis.print);
      return socket.broadcast.emit('tabRemoved', tab);
    });
    socket.on('tabUpdated', function(tab) {
      console.log("tab updated:");
      console.log(tab);
      redclient.set(tab['windowId'] + ":" + tab['id'], JSON.stringify(tab), redis.print);
      return socket.broadcast.emit('tabUpdated', tab);
    });
    socket.on('tabMoved', function(tab) {
      var id;
      console.log("tab moved:");
      console.log(tab);
      id = tab['id'];
      delete tab['oldIndex'];
      redclient.set(tab['windowId'] + ":" + tab['id'], JSON.stringify(tab), redis.print);
      redclient.lrem(tab['windowId'], 1, tab['id'], redis.print);
      redclient.lindex(tab['windowId'], tab['index'], function(error, result) {
        console.log("currently at that index: " + result);
        if (result != null) {
          console.log("inserting before result: " + result);
          return redclient.linsert(tab['windowId'], 'BEFORE', result, id, redis.print);
        } else {
          console.log("inserting at the end.");
          return redclient.rpush(tab['windowId'], id, redis.print);
        }
      });
      return socket.broadcast.emit('tabMoved', tab);
    });
    return socket.on('getAll', function(windowId) {
      console.log("getting all tabs for " + windowId);
      return redclient.lrange(windowId, 0, -1, function(err, res) {
        var key, _results;
        _results = [];
        for (key in res) {
          console.log("tab id: " + res[key]);
          _results.push(redclient.get(windowId + ":" + res[key], function(err2, res2) {
            console.log("tab data: " + res2);
            return socket.emit('tabAdded', res2);
          }));
        }
        return _results;
      });
    });
  };
  exports.handleSocket = handleSocket;
}).call(this);
