var express = require('express');
var router = express.Router();
var mongo = require("mongodb");
var config = require('config');
var url = require("url");
var checkAuth = require("./checkAuth").checkAuth
var isAlertsOp = require("./checkAuth").isAlertsOp


var DOMAIN = config.get('domain');
const MongoClient = mongo.MongoClient
const mongoClient = new MongoClient(config.get('db')) //mongodb://localhost:27017/






// alerts
router.get('/alerts', checkAuth, isAlertsOp, (req, res) => {

    mongoClient.connect(function(err, client) {
        if (err) { return console.log(err) }
        const db = client.db("school");
        const collection = db.collection("alerts");

        collection.find().toArray(function(err, results) {
            if (err) { return console.log(err) }
            res.render('admin/alerts', { host: DOMAIN, alerts: results });
            client.close();
        });
    });
})



router.post('/alerts/add', checkAuth, isAlertsOp, (req, res) => {
    if (!req.body.alert_text) {
        return res.redirect("/admin")
    }
    mongoClient.connect(function(err, client) {
        if (err) { return console.log(err) }
        const db = client.db("school");
        const collection = db.collection("alerts");

        collection.insertOne({ alert: req.body.alert_text }, (err, result) => {
            if (err) { return console.log(err) }
            //client.close();
        })
    });
    res.redirect("/admin")
})



router.get('/alerts/delete', checkAuth, isAlertsOp, (req, res) => {

    var id = url.parse(req.url, true).query.id
    if (!id) {
        return res.redirect("/admin")
    }

    mongoClient.connect(function(err, client) {
        if (err) { return console.log(err) }
        const db = client.db("school");
        const collection = db.collection("alerts");

        collection.deleteOne({ _id: mongo.ObjectId(id) }, (err, results) => {
            if (err) { return console.log(err) }
            //client.close();
        });
    });
    res.redirect("/admin")
})





module.exports = router;