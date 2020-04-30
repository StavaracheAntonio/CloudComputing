const express = require('express');
const router = express.Router();
const request = require('request');
const axios = require('axios')
const fs = require('fs');
const formidable = require('formidable');
const mysql = require('mysql')

String.prototype.splice = function(idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

const conn = mysql.createConnection({host: "friendlytextdb.mysql.database.azure.com",
  user: "*********************",
  password: "********************",
  database: "*************",
  Port: 3306, ssl: true})//{ca:fs.readFileSync("BaltimoreCyberTrustRoot.crt.pem")}});

function queryDatabase(){
  conn.query('SELECT * FROM FriendlyTextAccounts', 
  function (err, results, fields) {
    if (err) throw err;
    else console.log('Selected ' + results.length + ' row(s).');
    for (i = 0; i < results.length; i++) {
      console.log('Row: ' + JSON.stringify(results[i]));
    }
    console.log('Done.');
  })
};

conn.connect(
  function (err) { 
  if (err) { 
    console.log("!!! Cannot connect !!! Error:");
    throw err;
  }
  else{
      //console.log("Connection established.");
      //queryDatabase();
  }	
});

router.get('/', function(req, res, next) {
  // res.cookie("userData",{username:"test@test.test"})
  // console.log(req.cookies)
  if(req.cookies["userData"] == undefined)
    res.render('login', { title: 'Login' });
  else
    res.render('index', { title: 'FriendlyText' });
});

router.get('/Logout', function(req, res, next) {
  res.clearCookie("userData");
  res.send("success")
});

router.post('/Login', function(req, res, next){
  conn.query(`SELECT * FROM FriendlyTextAccounts WHERE email="${req.body["username"]}" AND password = "${req.body["password"]}"`, 
  function (err, results, fields) {
    if (err) throw err;
    else 
      if(results.length == 1){
        res.cookie("userData",{username : req.body["username"]})
        res.send("userExists")
      }
      else if(results.length == 0)
        res.send("userNonexistent")
  })
});

router.post('/Register', function(req, res, next){
  conn.query(`SELECT * FROM FriendlyTextAccounts WHERE email="${req.body["username"]}"`, 
  function (err, results, fields) {
    if (err) throw err;
    else 
      if(results.length == 1)
        res.send("userExists")
      else if(results.length == 0)
        conn.query(`INSERT INTO FriendlyTextAccounts (email, password) values ( "${req.body["username"]}", "${req.body["password"]}");`, 
        function (err, results, fields) {
          if (err){
            res.send("dbError")
            throw err;
          }
          else {
            console.log('Inserted ' + results.affectedRows + ' row(s).');
            res.cookie("userData",{username : req.body["username"]})
            res.send("userRegistered")
          }
        })
  })
});

router.get('/GetTokenAndSubdomain', function(req, res) {
    try {
        request.post({
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            url: `https://login.windows.net/${process.env.TENANT_ID}/oauth2/token`,
            form: {
                grant_type: 'client_credentials',
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                resource: 'https://cognitiveservices.azure.com/'
            }
        },
        function(err, resp, tokenResult) {
            if (err) {
                console.log(err);
                return res.status(500).send('CogSvcs IssueToken error');
            }

            var tokenResultParsed = JSON.parse(tokenResult);

            if (tokenResultParsed.error) {
                console.log(tokenResult);
                return res.send({error :  "Unable to acquire Azure AD token. Check the debugger for more information."})
            }

            var token = tokenResultParsed.access_token;
            var subdomain = process.env.SUBDOMAIN;
            return res.send({token, subdomain});
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send('CogSvcs IssueToken error');
    }
});

router.post('/AnalyzeFile', function(req, res) {
  var form = new formidable.IncomingForm();
  let resString = "";
  form.parse(req, function(err, fields, files) {
      axios.post('https://northeurope.api.cognitive.microsoft.com/vision/v2.0/ocr?language=en&detectOrientation=true', 
      fs.readFileSync(files["file"]["path"]),
      {headers: {
          "Content-Type":"application/octet-stream",
          "Ocp-Apim-Subscription-Key":"************************"
        }})
        .then((resp) => {
          for(var i = 0; i < resp.data["regions"][0]["lines"].length; i++)
                resp.data["regions"][0]["lines"][i]["words"].forEach(elem => resString = resString.concat(' ', elem["text"]));
          console.log(resString);
          return res.send(resString);
          })
        .catch((error) => {
          console.error(error)
        })
        
  });
});


router.post('/CorrectSpelling', function(req, res) {
  let text = req.body["text"]
  console.log(text.length)
  //console.log(req.body["text"])
  //console.log('api.cognitive.microsoft.com/bing/v7.0/spellcheck?mkt=en-US&mode=spell&text='.concat("",req.body["text"]))
  axios.post('https://northeurope.api.cognitive.microsoft.com/bing/v7.0/Spellcheck?text='.concat("",req.body["text"]), 
    null,
    {headers: {
      'Ocp-Apim-Subscription-Key' : "********************************"
    }})
    .then((resp) => {
      console.log(resp.data);
      let globalOffset = 0;

      resp.data["flaggedTokens"].forEach(elem => {
        console.log(elem["suggestions"])
        if(elem["suggestions"][0]["suggestion"].match(/[ ,.!?()]/g) == null)
          for(var i = elem["offset"] + globalOffset; i <= elem["offset"] + elem["suggestions"][0]["suggestion"].length + globalOffset; ++i){
            if(text[i].match(/[ \,\.\!\?\(\)]/g) != null){
              // console.log(i-elem["offset"]-globalOffset);
              text = text.splice(i,0,elem["suggestions"][0]["suggestion"].splice(0,i-elem["offset"]-globalOffset,""))
              globalOffset += elem["offset"] + elem["suggestions"][0]["suggestion"].length + globalOffset - i
              // console.log(globalOffset);
              break;
              }
            text = text.splice(i,1,elem["suggestions"][0]["suggestion"][i - elem["offset"]-globalOffset]);
            }
          })
      //console.log(text);
      console.log(text.length)
      return res.send(text);
      })
    .catch((error) => {
      console.error(error)
    })
});


module.exports = router;