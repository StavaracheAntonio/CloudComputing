var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

module.exports = {

    find_by_id: async function(obj_id){
        
        return new Promise((resolve, reject) => {
            
            MongoClient.connect(url, {useUnifiedTopology: true }, function(err, database) {
                if (err) reject(err);
            
                var db_obj = database.db("mydb");
                var query = { id: obj_id };
            
                db_obj.collection("snakes").find(query).toArray(function(err, result) {
                    if (err) throw reject(err);
                    database.close();
                    resolve(result)
                });
            });
        })
    },

    get_collection : async function(){
        
        return new Promise((resolve, reject) => {
            
            MongoClient.connect(url, {useUnifiedTopology: true }, function(err, database) {
                if (err) reject(err);
            
                var db_obj = database.db("mydb");
                var query = { };
            
                db_obj.collection("snakes").find(query).toArray(function(err, result) {
                    if (err) throw reject(err);
                    database.close();
                    resolve(result)
                });
            });
        })
    },

    exists : async function(obj_id){
        return new Promise((resolve, reject) => {
            
            MongoClient.connect(url, {useUnifiedTopology: true }, function(err, database) {
                if (err) reject(err);
            
                var db_obj = database.db("mydb");
                var query = { id: obj_id };
            
                db_obj.collection("snakes").find(query).toArray(function(err, result) {
                    //console.log(result.length)
                    if (err) throw reject(err);
                    database.close();
                    if (result.length > 0)
                        resolve(true);
                    else
                        resolve(false);
                });
            });
        })
    },

    delete_obj : async function(obj_id){
        return new Promise((resolve, reject) => {
            
            MongoClient.connect(url, {useUnifiedTopology: true }, function(err, database) {
                if (err) reject(err);
            
                var db_obj = database.db("mydb");
                var query = { id: obj_id };
                
                db_obj.collection("snakes").deleteMany(query, function(err, result) {
                    if (err) reject (err);
                    database.close();
                    resolve("1 document deleted")
                });

            });
        })
    },

    delete_all : async function(obj_id){
        return new Promise((resolve, reject) => {
            
            MongoClient.connect(url, {useUnifiedTopology: true }, function(err, database) {
                if (err) reject(err);
            
                var db_obj = database.db("mydb");
                var query = { };
                
                db_obj.collection("snakes").deleteMany(query, function(err, result) {
                    if (err) reject (err);
                    database.close();
                    resolve("all documents deleted")
                });

            });
        })
    },

    insert_obj : async function(myobj){
        return new Promise((resolve, reject) => {
            
            MongoClient.connect(url, {useUnifiedTopology: true }, function(err, database) {
                if (err) reject(err);
            
                var db_obj = database.db("mydb");
                
                db_obj.collection("snakes").insertOne(myobj, function(err, res) {
                    if (err) reject(err);
                    console.log("1 document inserted");
                    database.close();
                    resolve();
                });
            });
        })
    },
    
    insert_collection : async function( collection){
        return new Promise((resolve, reject) => {
            
            MongoClient.connect(url, {useUnifiedTopology: true }, function(err, database) {
                if (err) reject(err);
            
                var db_obj = database.db("mydb");

                //var myobj = { name: "Company Inc", address: "Highway 37" };
                
                db_obj.collection("snakes").insertMany( collection, function(err, res) {
                    if (err) reject (err);
                    console.log("collection inserted");
                    database.close();
                    resolve();
                });
            });
        })
    }

}

