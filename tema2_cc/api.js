const http = require("http")
const url = require('url');
const handler = require('./handler')


const parse = require('./body_parser')

const server = http.createServer((request, response) => {
    let path = request.url;
    let method = request.method;
    console.log(method, path);
    path = url.parse(request.url,true).pathname;
    

    switch (method) {
        case "POST":

            if (path === "/snakes" || path === "/snakes/")  {
                handler.POST(request, response).then(resp => {
                    console.log(resp);
                    response.writeHead(201, { "Content-type": "text/plain" })
                    response.write('Created')
                    response.end()

                }).catch(error => {
                    console.log(error);
                    response.writeHead(error[0], { "Content-type": "text/plain" });
                    response.write(error[1]);
                    response.end();
                })
            }else{
                response.writeHead(404, { "Content-type": "text/plain" });
                response.write("resource not found");
                response.end();
            }

            break

        case "GET":
            if (path === "/snakes" || path === "/snakes/")  {
                handler.GET(request, response).then(resp => {
                    console.log(resp);
                    response.writeHead(200, { "Content-type": "text/plain" })
                    response.write(JSON.stringify(resp))
                    response.end()

                }).catch(error => {
                    response.writeHead(error[0], { "Content-type": "text/plain" });
                    response.write(error[1]);
                    response.end();
                })
            }else{
                response.writeHead(404, { "Content-type": "text/plain" });
                response.write("resource not found");
                response.end();
            }

            break
    
        case "PUT":
            
            if (path === "/snakes" || path === "/snakes/")  {
                handler.PUT(request, response).then(resp => {
                    console.log(resp);
                    response.writeHead(200, { "Content-type": "text/plain" })
                    response.write('OK')
                    response.end()
    
                }).catch(error => {
                    console.log(error);
                    response.writeHead(error[0], { "Content-type": "text/plain" });
                    response.write(error[1]);
                    response.end();
                })
            }else{
                response.writeHead(404, { "Content-type": "text/plain" });
                response.write("resource not found");
                response.end();
            }
    
            break
    
        case "DELETE":
            if (path === "/snakes" || path === "/snakes/")  {
                handler.DELETE(request, response).then(resp => {
                    console.log(resp);
                    response.writeHead(200, { "Content-type": "text/plain" });
                    response.write("OK");
                    response.end()

                }).catch(error => {
                    response.writeHead(error[0], { "Content-type": "text/plain" });
                    response.write(error[1]);
                    response.end();
                })
            }else{
                response.writeHead(404, { "Content-type": "text/plain" });
                response.write("resource not found");
                response.end();
            }
            break

        case "PATCH":
            
            if (path === "/snakes" || path === "/snakes/")  {
                handler.PATCH(request, response).then(resp => {
                    console.log(resp);
                    response.writeHead(200, { "Content-type": "text/plain" })
                    response.write('OK')
                    response.end()
        
                }).catch(error => {
                    console.log(error);
                    response.writeHead(error[0], { "Content-type": "text/plain" });
                    response.write(error[1]);
                    response.end();
                })
            }else{
                response.writeHead(404, { "Content-type": "text/plain" });
                response.write("resource not found");
                response.end();
            }
        
            break
    
        default:
            response.writeHead(400, { "Content-type": "text/plain" })
            response.write("Invalid URL")
            response.end()
      }
})
server.listen(3000, () => {
    console.log(`Server running on Port 3000`)
})