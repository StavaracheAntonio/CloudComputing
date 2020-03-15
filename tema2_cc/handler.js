var db = require('./crud_db')
const parse = require('./body_parser')

module.exports = {

    GET: async function(request, response){
        return new Promise((resolve, reject) => {
            
            try{ 
                const myURL = new URL( request.headers['host'] + request.url);
                var id = myURL.searchParams.get('id');}
            catch (err){ var id = ""; }
            
            if (id === "" || id === null){
                db.get_collection().then(resp => {
                    for (var j = 0; j < resp.length; j++){
                        delete resp[j]['_id'];
                    }
                    resolve(resp)
                }).catch(error => {
                    console.log("1",error)
                    reject([500, "Internal error."]);
                })
            }else{
                db.find_by_id(parseInt (id)).then(resp => {
                    //console.log(resp);
                    if (resp.length != 1)
                        reject([404, "ID not found"]); 
                    delete resp[0]['_id'];
                    resolve(resp[0])
                }).catch(error => {
                    reject([500, "Internal error."]);
                })
            }
        })
    },

    POST: async function(request, response){
        try{
            await parse(request);}
        catch(err){
            return new Promise((resolve, reject) => { reject ([415, "Unsupported Media Type"])})
        }

        return new Promise((resolve, reject) => {

            try{ 
                const myURL = new URL( request.headers['host'] + request.url);
                var id = myURL.searchParams.get('id');}
            catch (err){ var id = ""; }
            
            if (id === "" || id === null){

                var exists = [];

                for (var j = 0; j < request.body.length; j++){
                    exists.push(
                    db.exists(parseInt (request.body[j]['id'])).then(resp => {
                        return resp;
                    }).catch(error => {
                        reject([500, "Internal error."]);
                    }))
                }
                Promise.all(exists).then(function(values) {
                    var exist = false;
                    for (var j = 0; j < request.body.length; j++){
                        exist = exist || values[j];
                    }

                    if (exist == false){
                        db.insert_collection( request.body).then(response => {
                            resolve();
                        }).catch(error => {
                            reject([500, "Internal error."]);
                        })
                    }else{
                        reject([409, "Conflict"]);
                    }
                });

            }else{
                request.body["id"] = parseInt (id);
                db.exists(parseInt (id)).then(resp => {
                    if (resp == true){
                        reject([409, "Conflict"]); 
                    }
                    else{
                        db.insert_obj( request.body).then(response => {
                            resolve();
                        }).catch(error => {
                            reject([500, "Internal error."]);
                        })
                    }
                }).catch(error => {
                    reject([500, "Internal error."]);
                })
            }
        })
    },

    DELETE: async function(request, response){
        //await parse(request);
        return new Promise((resolve, reject) => {
            
            let url = request.url
            let method = request.meth
            try{ 
                const myURL = new URL( request.headers['host'] + request.url);
                var id = myURL.searchParams.get('id');
            }
            catch (err){ var id = ""; }
            
            if (id === "" || id === null){
                db.delete_all().then(resp => {
                    resolve(resp)
                }).catch(error => {
                    console.log(error)
                    reject([500, "Internal error."]);
                })
            }else{
                db.exists(parseInt (id)).then(resp => {
                    if (resp == false){
                        reject([404, "ID not found"]); 
                    }
                    db.delete_obj(parseInt (id)).then(response => {
                        resolve();
                    }).catch(error => {
                        reject([500, "Internal error."]);
                    })
                }).catch(error => {
                    reject([500, "Internal error."]);
                })
            }
        })
    },

    PUT: async function(request, response){
        try{
            await parse(request);}
        catch(err){
            return new Promise((resolve, reject) => { reject ([415, "Unsupported Media Type"])})
        }

        return new Promise((resolve, reject) => {

            try{ 
                const myURL = new URL( request.headers['host'] + request.url);
                var id = myURL.searchParams.get('id');}
            catch (err){ var id = ""; }
            
            if (id === "" || id === null){

                db.delete_all().then(resp => {
                    db.insert_collection( request.body).then(response => {
                        resolve();
                    }).catch(error => {
                        reject([500, "Internal error."]);
                    })
                }).catch(error => {
                    console.log(error)
                    reject([500, "Internal error."]);
                });

            }else{
                request.body["id"] = parseInt (id);
                db.exists(parseInt (id)).then(resp => {
                    if (resp == true){
                        db.delete_obj( parseInt(id)).then(resp =>{
                            db.insert_obj( request.body).then(response => {
                                resolve();
                            }).catch(error => {
                                reject([500, "Internal error."]);
                            })
                        }).catch(error => {
                            reject([500, "Internal error."]);
                        })
                    }
                    else{
                        reject([404, "Not Found"]);
                    }
                }).catch(error => {
                    reject([500, "Internal error."]);
                })
            }
        })
    },

    PATCH: async function(request, response){
        try{
            await parse(request);}
        catch(err){
            return new Promise((resolve, reject) => { reject ([415, "Unsupported Media Type"])})
        }

        return new Promise((resolve, reject) => {

            try{ 
                const myURL = new URL( request.headers['host'] + request.url);
                var id = myURL.searchParams.get('id');}
            catch (err){ var id = ""; }
            
            if (id === "" || id === null){
                
                reject([401, "Unauthorized"]);

            }else{
                request.body["id"] = parseInt (id);
                db.exists(parseInt (id)).then(resp => {
                    if (resp == true){
                        db.find_by_id( parseInt(id)).then(resp =>{
                            resp = resp[0]
                            for ( var e in request.body){
                                resp[e] = request.body[e];
                            }
                            delete resp["_id"];
                            console.log(resp);
                            db.delete_obj(parseInt (id)).then(response => {
                                db.insert_obj( resp).then(response => {
                                    resolve();
                                }).catch(error => {
                                    console.log(error);
                                    reject([500, "Internal error."]);
                                })
                            }).catch(error => {
                                console.log(error);
                                reject([500, "Internal error."]);
                            })
                        }).catch(error => {
                            console.log(error);
                            reject([500, "Internal error."]);
                        })
                    }
                    else{
                        reject([404, "Not Found"]);
                    }
                }).catch(error => {
                    console.log(error);
                    reject([500, "Internal error."]);
                })
            }
        })
    }
}