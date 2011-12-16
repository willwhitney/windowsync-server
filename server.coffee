http = require "http"
url = require "url"
socketio = require("socket.io")
port = process.env.PORT ? 12966

start = (route, handleSocket, handle) ->
    onRequest = (request, response) ->
        pathname = url.parse(request.url).pathname
        console.log "request for #{pathname} received."
        
        route(handle, pathname, response)
        
    app = http.createServer(onRequest)
    io = socketio.listen(app)
    io.configure( () -> 
        io.set("transports", ["xhr-polling"])
        io.set("polling duration", 5)
    )
    app.listen(port)
    console.log "server started"
    
    io.sockets.on('connection', (socket) ->
        handleSocket(socket)
    )
    
exports.start = start
