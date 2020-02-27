require('dotenv').config()
var apis = require('./external-APIs')

const http = require('http')
const fs = require('fs')
const port = 3000
var qs = require('querystring');
const url = require('url');
const notFoundRenderer = require('./404');
const noContentRenderer = require('./204');
const searchRenderer = require('./search');

const server = http.createServer(function(req, res) {

    let start_time = new Date().getTime()

    var r = 'request was made: ' + req.url
    var t = 'start_time: ' + String(new Date(start_time))
    const path = url.parse(req.url,true).pathname;

    if (path === '/home' || path === '/'){
        res.writeHead(200, { 'Content-Type': 'text/html' })
        fs.readFile('index.html', function(error, data) {
            if (error) {
                res.writeHead(404)
                res.write('Error: File Not Found')
            } else {
                res.write(data)
            }
            res.end()
        })
    } else if (path === '/intermediate-search'){

        if (req.method == 'POST') {
            var body = '';
    
            req.on('data', function (data) {
                body += data;
            });
    
            req.on('end', function () {
                var post = qs.parse(body);
                const myURL = new URL(req.headers['host'] + '/search/');

                myURL.searchParams.append('city1', post['city1']);
                myURL.searchParams.append('city2', post['city2']);
                res.writeHead(301, { "Location":"http://" + myURL.href});
                console.log(r)
                console.log(t)
                console.log('duration: ' + ( new Date().getTime() - start_time)) 
                return res.end();
            });
        }
    }
    else if (path === '/search/'){
        const myURL = new URL( req.headers['host'] + req.url);

        var c1 = myURL.searchParams.get('city1');
        var c2 = myURL.searchParams.get('city2');

        apis.first_apis_info(c1, c2)
        .then(response => {
            
            apis.infection_risk(response)
            .then(response2 => {
                res.writeHead(200, {'Content-Type': 'text/html'})
                res.write( searchRenderer(response2))
                console.log(r)
                console.log(t)
                console.log('duration: ' + ( new Date().getTime() - start_time)) 
                return res.end()
            })
            .catch(error => {
                res.writeHead(404, {'Content-Type': 'text/html'})
                res.write(noContentRenderer());
                console.log(r)
                console.log(t)
                console.log('duration: ' + ( new Date().getTime() - start_time)) 
                return res.end()
            });

       })
        .catch(error => {
            res.writeHead(404, {'Content-Type': 'text/html'})
            res.write(noContentRenderer());
            console.log(r)
            console.log(t)
            console.log('duration: ' + ( new Date().getTime() - start_time)) 
            return res.end()
        });
    }
    else if (path === '/search-json/'){
        const myURL = new URL( req.headers['host'] + req.url);

        var c1 = myURL.searchParams.get('city1');
        var c2 = myURL.searchParams.get('city2');
        
        apis.first_apis_info(c1, c2)
        .then(response => {
            apis.infection_risk(response)
            .then(response2 => {
                var json = JSON.stringify({ 
                    data: response2
                })
                res.writeHead(200, {'Content-Type': 'text/html'})
                res.write( json)
                console.log(r)
                console.log(t)
                console.log('duration: ' + ( new Date().getTime() - start_time)) 
                return res.end()
            })
            .catch(error => {
                console.log(error.message)
            });

       })
        .catch(error => {
            res.writeHead(204, {'Content-Type': 'text/html'})
            var json = JSON.stringify({ 
                data: "no content"
            })
            res.write(json)
            console.log(r)
            console.log(t)
            console.log('duration: ' + ( new Date().getTime() - start_time)) 
            return res.end()
        });
    }
    else {
        res.writeHead(404, {'Content-Type': 'text/html'})
        res.write(notFoundRenderer());
        console.log(r)
        console.log(t)
        console.log('duration: ' + ( new Date().getTime() - start_time)) 
        res.end()
    }
})

server.listen(port, function(error){
    if (error){
        console.log('Something went wrong', error)
    }else{
        console.log('Server is listening on port' + port)
    }
})