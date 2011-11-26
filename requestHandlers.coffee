fs = require 'fs'
# redis = require "redis"
# redclient = redis.createClient()

# redclient.on("error", (err) ->
    # console.log "redis error: " + err
# )

start = (response) ->    
    

    fs.readFile('index.html', (err, data) ->
        if (err) 
            response.writeHead(500)
            return res.end('Error loading index.html')
        
        response.writeHead(200)
        response.write(data + "\n")
        response.write(process.env.PORT ? 8888)
        response.end()
    )

        
exports.start = start

