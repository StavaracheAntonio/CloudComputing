var http = require('http');
var https = require('https');
var fs = require('fs');

const fetch = require('node-fetch');
const axios = require('axios')

const WEATHER_API_KEY = process.env.WEATHER_API_KEY
const RANDOM_API_KEY = process.env.RANDOM_API_KEY

module.exports = {

    infection_risk: function(d){
        return new Promise((resolve, reject) => {
            var score = 100
            
            var result = []
            if (d[1] == false)
                result.push("there's no direct flight between locations")
            else
                result.push("direct flight between locations")
            result.push("second location's temperature: " + d[0][2][0] + " celsius degrees")
            result.push("second location's humidity: " + d[0][2][1] + "%")

            if ( d[0][2][0] < 15.0 )
                score -= 30
            if ( d[0][2][1] < 40 )
                score -= 30
            if ( d[1] === false )
                score -= 30

            this.rand_api(score).then(resp =>{
                if (resp[0] < 33)
                    var res1 = 'low risk of infection'
                else if (resp[0] < 73)
                    var res1 = 'medium risk of infection'
                else
                    var res1 = 'high of infection'
                result.push(res1)
                resolve(result)
            })
            .catch(error => {
                reject ( error.message)
            });
        })
    },

    rand_api: function(score){
        return new Promise((resolve, reject) => {
            axios.post('https://api.random.org/json-rpc/2/invoke', {
                    "jsonrpc": "2.0",
                    "method": "generateSignedIntegers",
                    "params": {
                        "apiKey": String(RANDOM_API_KEY),
                        "n": 1,
                        "min": 1,
                        "max": score,
                        "replacement": true
                    },
                    "id": 10720
                },
            )
            .then((res) => {
                resolve(res.data.result.random.data)
            })
            .catch((error) => {
                reject (error.message)
            })
            
        });
    },

    weather:function (city) {
        return new Promise((resolve, reject) => {
            http.get('http://api.openweathermap.org/data/2.5/weather?q='+city+'&units=metric&appid='+String (WEATHER_API_KEY), (resp) => {
                let data = '';

                resp.on('data', (chunk) => {
                    data += chunk;
                });

                resp.on('end', () => {   
                    var res = JSON.parse(data)
                    try{
                        resolve ( [res['main']['temp'], res['main']['humidity']])
                    }catch(e){
                        reject(e.message)
                    }
                });

            }).on("error", (err) => {
                reject('error at weather api')
            });
        });
    },

    city_id:function (city){
        return new Promise((resolve, reject) => {
            let data = '';
            https.get('https://api.skypicker.com/locations?term=' + city + '&locale=en-US&location_types=airport&limit=5&active_only=true&sort=name', (resp) => {

                resp.on('data', (chunk) => {
                    data += chunk;
                });

                resp.on('end', () => {
                    try{
                        data = JSON.parse(data)['locations'][0]['city']['id']
                        resolve(data)
                    }catch (e) {
                        reject(e.message);
                    }
                });
            }).on("error", (err) => {
                reject(`Got error: ${err.message}`);
            });
        });
    },

    direct_flights:function (id1, id2){
        return new Promise((resolve, reject) => {
            let data = '';
            https.get('https://api.skypicker.com/flights?fly_from=' + id1 + '&fly_to=' + id2 + '&limit=1&max_stopovers=0&partner=picky', (resp) => {

                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    try{
                        resolve(JSON.parse(data)['data'].length > 0)
                    }catch (e) {
                        reject(e.message);
                    }
                });
            }).on("error", (err) => {
                reject(`Got error: ${err.message}`);
            });
        });
    },

    first_apis_info: function(city1, city2){
        return new Promise((resolve, reject) => {
            
            Promise.all([ this.city_id(city1), this.city_id(city2), this.weather(city2)])
            .then(response => {
                this.direct_flights(response[0], response[1]).then(resp =>{
                    resolve ([response, resp])
                })
                .catch(error => {
                    reject (false)
                });
            })
            .catch(error => {
                reject (false)
            });
        });
    }
}

