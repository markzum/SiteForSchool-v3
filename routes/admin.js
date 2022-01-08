var express = require('express');
var router = express.Router();
var mongo = require("mongodb");
var config = require('config');
var url = require("url");
var jwt = require('jsonwebtoken')
const fs = require("fs")
const multer  = require("multer");



const tokenKey = '8a5b-3c67d-5epf-7gm9'


var DOMAIN = config.get('domain');
const MongoClient = mongo.MongoClient
const mongoClient = new MongoClient(config.get('db')) //mongodb://localhost:27017/

const rootdir = __dirname + "/../"




router.get('/', checkAuth, (req, res) => {
  res.render("admin/admin", {host: DOMAIN})
})



router.get('/login', (req, res) => {
  res.render("admin/login", {host: DOMAIN})
})


router.post('/login', (req, res) => {
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



router.post('/alerts/add', checkAuth, (req, res) => {
  if (!req.body.alert_text){
    return res.redirect("/admin")
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





// persons
router.get('/persons', checkAuth, (req, res) => {

  mongoClient.connect(function(err, client){
    if (err) {return console.log(err)}
    const db = client.db("school");
    const collection = db.collection("persons");

    collection.find().toArray(function(err, results){
        if (err) {return console.log(err)}
        res.render('admin/persons', {host: DOMAIN, persons: results});
        client.close();
    });
  });
})



router.post('/persons/add', checkAuth, multer({dest:"storage/persons-storage/"}).single("photo"), (req, res) => {
  if (!req.body.name){
    return res.redirect("/admin")
  }

  if (req.file){
    let photo = req.file;
    
    fs.rename(photo.path, photo.destination+photo.originalname, (err) => {
      if (err) throw err;
    });

    var img = "%domain%"+photo.destination+photo.originalname

  } else if (req.body.photo2){
    var img = "%domain%storage/persons-storage/"+req.body.photo2

  } else if (req.body.photo3){
    var img = req.body.photo3
    
  } else {
    var img = "no"
  }


  if (req.body.position) {
    var position = req.body.position
  } else {
    var position = 'no'
  }

  mongoClient.connect(function(err, client){
    if (err) {return console.log(err)}
    const db = client.db("school");
    const collection = db.collection("persons");

    var add_person = {
      "name": req.body.name,
      "short_description": req.body.short_description,
      "description": req.body.description,
      "class": req.body.class,
      "position": position,
      "img": img,
    }

    collection.insertOne(add_person, (err, result) => {
      if (err) {return console.log(err)}
      //client.close();
    })
  });
  res.redirect("/admin")
})



router.get('/persons/delete', checkAuth, (req, res) => {

  var id = url.parse(req.url, true).query.id
  if (!id){
    return res.redirect("/admin")
  }

  mongoClient.connect(function(err, client){
    if (err) {return console.log(err)}
    const db = client.db("school");
    const collection = db.collection("persons");

    collection.deleteOne({_id: mongo.ObjectId(id)}, (err, results) => {
        if (err) {return console.log(err)}
        //client.close();
    });
  });
  res.redirect("/admin")
})





//persons-storage
router.get('/persons-storage', checkAuth, (req, res) => {
  var storage_dir = rootdir+"storage/persons-storage/"

  fs.readdir(storage_dir, function(err, items) {
    var files = []
    if (items){
      for (var i=0; i<items.length; i++) {
          var file = {
            "name": items[i],
            "file": storage_dir + items[i],
            "url": DOMAIN + "storage/persons-storage/" + items[i],
          }
          files.push(file)
      }
      res.render('admin/persons-storage', {host: DOMAIN, files: files});
    } else {
      res.render('admin/persons-storage', {host: DOMAIN, files: []});
    }
  })
})



router.post('/persons-storage/add', checkAuth, multer({dest:"storage/persons-storage/"}).single("photo"), (req, res) => {
  if (!req.file){
    return res.redirect("/admin")
  }

  let photo = req.file;
    
  fs.rename(photo.path, photo.destination+photo.originalname, (err) => {
    if (err) throw err;
  });

  res.redirect("/admin")

})



router.get('/persons-storage/delete', checkAuth, (req, res) => {
  var filename = url.parse(req.url, true).query.filename

  if (!filename){
    return res.redirect("/admin")
  }

  fs.unlink(rootdir+"storage/persons-storage/"+filename, (err) => {
    if (err) {return console.log(err)}
  })

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