var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


async function drop_db() {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, {useUnifiedTopology: true }, function(error, database) {
            if (error) throw error;
            var dbobj = database.db("mydb");
            dbobj.collection("snakes").drop(function(err, deleted) {
                console.log("drop collection...")
                if (err) {
                    console.log("collection not found");
                    resolve();
                }
                if (deleted){ 
                    console.log("collection deleted");
                    database.close();
                    resolve();
                }
            });
        });
    })
}


async function create_db(){

    try {
        await drop_db()
    }
    catch (err) {
        console.log("2",err);
    }

    return new Promise( (resolve, reject) =>{
        
        MongoClient.connect(url, {useUnifiedTopology: true }, function(error, database) {
        if (error) reject(error);
        var dbobj = database.db("mydb");

        dbobj.createCollection("snakes", function(err, res) {
                if (err) reject (err);
                console.log("collection created");
                database.close();
                resolve()
            });
        });
    
    });
}

create_db().then(response => {
    MongoClient.connect(url, {useUnifiedTopology: true }, function(error, database) {
        if (error) throw error;
    
        var my_collection = [
            { id: 123, name: 'black mamba', family:'Elapidae', lifespan: '11 years', weight: '1.03 kg', venom: '100–120 mg/bite'},
            { id: 55, name: 'boa constrictor', family: 'Boidae', lifespan: '30 years', weight: '45 kg'},
            { id: 37, name: 'king cobra', family: 'Elapidae', lifespan:'20 years', weight: '10 kg', venom: '420 mg/bite'},
            { id: 51, name: 'anaconda', family: 'Boidae', lifespan: '10 years', length: '4,6 m'}
        ];
    
        var dbobj = database.db("mydb");
        
        dbobj.collection("snakes").insertMany(my_collection, function(err, res) {
          
            if (err) throw err;
            console.log("Number of documents inserted: " + res.insertedCount);
            database.close();
        });
    
    });
    
})
.catch(error => {
    console.log("1",error)
})
