var express = require('express');
var router = express.Router();
var mongo = require("mongodb")
var url = require("url");
var config = require('config');


var DOMAIN = config.get('domain');
const MongoClient = mongo.MongoClient
const mongoClient = new MongoClient(config.get('db')) //mongodb://localhost:27017/



//administration
router.get('/administration', (req, res) => {
    mongoClient.connect(function(err, client){
        if (err) {return console.log(err)}
        const db = client.db("school");
        const collection = db.collection("persons");
    
        collection.find({class: "administration"}).toArray(function(err, results){
            if (err) {return console.log(err)}
            var sorted_results = results.sort(sortPersonsArray);
            for (var pers of sorted_results) {
                pers.img = pers.img.replace("%domain%", DOMAIN)
            }
            res.render('persons/administration', {host: DOMAIN, sectionTitle: "persons", persons: sorted_results});
            client.close();
        });
    });
});



//teachers
router.get('/teachers', (req, res) => {
    mongoClient.connect(function(err, client){
        if (err) {return console.log(err)}
        const db = client.db("school");
        const collection = db.collection("persons");
    
        collection.find({class: "teacher"}).toArray(function(err, results){
            if (err) {return console.log(err)}
            var sorted_results = results.sort(sortPersonsArray);
            for (var pers of sorted_results) {
                pers.img = pers.img.replace("%domain%", DOMAIN)
            }
            res.render('persons/teachers', {host: DOMAIN, sectionTitle: "persons", persons: sorted_results});
            client.close();
        });
    });
});



//teachers
router.get('/teachers-odod', (req, res) => {
    mongoClient.connect(function(err, client){
        if (err) {return console.log(err)}
        const db = client.db("school");
        const collection = db.collection("persons");
    
        collection.find({class: "teacher_odod"}).toArray(function(err, results){
            if (err) {return console.log(err)}
            var sorted_results = results.sort(sortPersonsArray);
            for (var pers of sorted_results) {
                pers.img = pers.img.replace("%domain%", DOMAIN)
            }
            res.render('persons/teachers-odod', {host: DOMAIN, sectionTitle: "persons", persons: sorted_results});
            client.close();
        });
    });
});



//person's page
router.get('/person-page', (req, res) => {
    mongoClient.connect(function(err, client){
        if (err) {return console.log(err)}
        const db = client.db("school");
        const collection = db.collection("persons");
        var id = url.parse(req.url, true).query.id
        if (id.length != 24){ return res.status(404).render('error-404', {host: DOMAIN}); }
        collection.find({"_id": mongo.ObjectId(id)}).toArray(function(err, results){
            if (err) {return console.log(err)}
            if (results[0]) {
                results[0].img = results[0].img.replace("%domain%", DOMAIN)
                
                res.render('persons/person-page', {host: DOMAIN, sectionTitle: "persons", person: results[0]});
            } else {
                res.status(404).render('error-404', {host: DOMAIN});
            }
            client.close();
        });
    });
});



router.get('/social-pedagogue', (req, res) => {
    res.render('persons/social-pedagogue', {host: DOMAIN, sectionTitle: "persons"}); 
});



function sortPersonsArray(x, y){
    return x.name.localeCompare(y.name);
}



module.exports = router;