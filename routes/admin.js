var express = require('express');
var router = express.Router();
var mongo = require("mongodb");
var config = require('config');
var url = require("url");
var bodyParser = require('body-parser')
var jwt = require('jsonwebtoken')
var LocalStorage = require('node-localstorage').LocalStorage;



const tokenKey = '8a5b-3c67d-5epf-7gm9'

const urlencodedParser = bodyParser.urlencoded({extended: false,})
localStorage = new LocalStorage('./scratch');

var DOMAIN = config.get('domain');
const MongoClient = mongo.MongoClient
const mongoClient = new MongoClient(config.get('db')) //mongodb://localhost:27017/




router.get('/', checkAuth, (req, res) => {
  res.render("admin/admin", {host: DOMAIN})
})



router.get('/login', (req, res) => {
  res.render("admin/login", {host: DOMAIN})
})


router.post('/login', urlencodedParser, (req, res) => {
  if (req.body.username === "markzum" && req.body.password === "qwe"){

    let token = jwt.sign({ username: "markzum" }, tokenKey, { expiresIn: "1h" })
    // set cookies
    res.cookie('token', token)

  }
  res.redirect("/admin")
})


router.get('/logout', checkAuth, (req, res) => {
  res.clearCookie("token")
  res.redirect("/")
})



// alerts
router.get('/alerts', checkAuth, (req, res) => {

  mongoClient.connect(function(err, client){
    if (err) {return console.log(err)}
    const db = client.db("school");
    const collection = db.collection("alerts");

    collection.find().toArray(function(err, results){
        if (err) {return console.log(err)}
        res.render('admin/alerts', {host: DOMAIN, alerts: results});
        client.close();
    });
  });
})


router.post('/alerts/add', checkAuth, urlencodedParser, (req, res) => {
  if (!req.body.alert_text){
    res.redirect("/admin")
  }
  mongoClient.connect(function(err, client){
    if (err) {return console.log(err)}
    const db = client.db("school");
    const collection = db.collection("alerts");

    collection.insertOne({alert: req.body.alert_text}, (err, result) => {
      if (err) {return console.log(err)}
      //client.close();
    })
  });
  res.redirect("/admin")
})



router.get('/alerts/delete', checkAuth, (req, res) => {

  var id = url.parse(req.url, true).query.id
  if (!id){
    return res.redirect("/admin")
  }

  mongoClient.connect(function(err, client){
    if (err) {return console.log(err)}
    const db = client.db("school");
    const collection = db.collection("alerts");

    collection.deleteOne({_id: mongo.ObjectId(id)}, (err, results) => {
        if (err) {return console.log(err)}
        //client.close();
    });
  });
  res.redirect("/admin")
})


  

// checkAuth
function checkAuth(req, res, next) {
  // get cookies
  let token = req.cookies.token

  if (!token){
    return res.redirect("/admin/login")
  }

  jwt.verify(token, tokenKey, function(err, decoded) {
    if (decoded) {
      return next()
    } else {
      return res.redirect("/admin/login")
    }

  });
    
}




module.exports = router;