var express = require('express');
var router = express.Router();
var mongo = require("mongodb");
var config = require('config');
var url = require("url");
const fs = require("fs")
const multer = require("multer");
var checkAuth = require("./checkAuth").checkAuth
var isPersonsOp = require("./checkAuth").isPersonsOp


var DOMAIN = config.get('domain');
const MongoClient = mongo.MongoClient
const mongoClient = new MongoClient(config.get('db')) //mongodb://localhost:27017/





// persons
router.get('/persons', checkAuth, isPersonsOp, (req, res) => {

    mongoClient.connect(function(err, client) {
        if (err) { return console.log(err) }
        const db = client.db("school");
        const collection = db.collection("persons");

        collection.find().toArray(function(err, results) {
            if (err) { return console.log(err) }
            res.render('admin/persons', { host: DOMAIN, persons: results });
            client.close();
        });
    });
})



// add
router.post('/persons/add', checkAuth, isPersonsOp, multer({ dest: "storage/" }).single("photo"), (req, res) => {
    if (!req.body.name) {
        return res.redirect("/admin")
    }

    if (req.file) {
        let photo = req.file;

        if (photo.originalname.split("_")[0] === "persons-storage") {
            fs.rename(photo.path, photo.destination + photo.originalname, (err) => {
                if (err) throw err;
            });

            var img = "%domain%" + photo.destination + photo.originalname
        } else {
            fs.rename(photo.path, photo.destination + "persons-storage_" + photo.originalname, (err) => {
                if (err) throw err;
            });

            var img = "%domain%" + photo.destination + "persons-storage_" + photo.originalname
        }

    } else if (req.body.photo2) {
        var img = "%domain%storage/" + req.body.photo2

    } else if (req.body.photo3) {
        var img = req.body.photo3

    } else {
        var img = "no"
    }


    if (req.body.position) {
        var position = req.body.position
    } else {
        var position = 'no'
    }

    mongoClient.connect(function(err, client) {
        if (err) { return console.log(err) }
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
            if (err) { return console.log(err) }
            //client.close();
        })
    });
    res.redirect("/admin")
})



// delete
router.get('/persons/delete', checkAuth, isPersonsOp, (req, res) => {

    var id = url.parse(req.url, true).query.id
    if (!id) {
        return res.redirect("/admin")
    }

    mongoClient.connect(function(err, client) {
        if (err) { return console.log(err) }
        const db = client.db("school");
        const collection = db.collection("persons");

        collection.deleteOne({ _id: mongo.ObjectId(id) }, (err, results) => {
            if (err) { return console.log(err) }
            //client.close();
        });
    });
    res.redirect("/admin")
})



// edit
router.get('/persons/edit', checkAuth, isPersonsOp, (req, res) => {

    var id = url.parse(req.url, true).query.id
    if (!id) {
        return res.redirect("/admin")
    }

    mongoClient.connect(function(err, client) {
        if (err) { return console.log(err) }
        const db = client.db("school");
        const collection = db.collection("persons");

        collection.find({ "_id": mongo.ObjectId(id) }).toArray(function(err, results) {
            if (err) { return console.log(err) }
            if (results[0]) {
                res.render('admin/persons-edit', { host: DOMAIN, person: results[0] })
            } else {
                res.status(404).render('error-404', { host: DOMAIN });
            }
            client.close();
        });
    });
})



router.post('/persons/edit', checkAuth, isPersonsOp, multer({ dest: "storage/" }).single("photo"), (req, res) => {
    if (!req.body.name) {
        return res.redirect("/admin")
    }

    if (req.file) {
        let photo = req.file;

        fs.rename(photo.path, photo.destination + photo.originalname, (err) => {
            if (err) throw err;
        });

        var img = "%domain%" + photo.destination + photo.originalname

    } else if (req.body.photo2) {
        var img = req.body.photo2

    } else {
        var img = "no"
    }


    if (req.body.position) {
        var position = req.body.position
    } else {
        var position = 'no'
    }

    var id = req.body.id

    mongoClient.connect(function(err, client) {
        if (err) { return console.log(err) }
        const db = client.db("school");
        const collection = db.collection("persons");

        var edit_person = {
            "name": req.body.name,
            "short_description": req.body.short_description,
            "description": req.body.description,
            "class": req.body.class,
            "position": position,
            "img": img,
        }

        collection.updateOne({ _id: mongo.ObjectId(id) }, { $set: edit_person }, (err, result) => {
            if (err) { return console.log(err) }
            //client.close();
        })
    });
    res.redirect("/admin")
})





module.exports = router;