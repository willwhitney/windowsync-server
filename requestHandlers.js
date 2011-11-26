(function() {
  var fs, start;
  fs = require('fs');
  start = function(response) {
    return fs.readFile('index.html', function(err, data) {
      if (err) {
        response.writeHead(500);
        return res.end('Error loading index.html');
      }
      response.writeHead(200);
      response.write(data + "\n");
      return response.end();
    });
  };
  exports.start = start;
}).call(this);
