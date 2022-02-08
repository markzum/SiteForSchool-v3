var express = require('express');
var router = express.Router();
var config = require('config');
var jwt = require('jsonwebtoken')
var mongo = require("mongodb")
var checkAuth = require("./checkAuth").checkAuth


const tokenKey = '8a5b-3c67d-5epf-7gm9'

var DOMAIN = config.get('domain');
const MongoClient = mongo.MongoClient
const mongoClient = new MongoClient(config.get('db'))




router.get('/', checkAuth, (req, res) => {
    let token = req.cookies.token
    const payload = jwt.verify(token, tokenKey, { ignoreExpiration: true });
    res.render("admin/admin", { host: DOMAIN, username: payload.username, role: payload.role })
})



router.get('/login', (req, res) => {
    res.render("admin/login", { host: DOMAIN, error: "false" })
})



router.post('/login', (req, res) => {
    mongoClient.connect(function(err, client) {
        if (err) { return console.log(err) }
        const db = client.db("school");
        const collection = db.collection("admins");

        collection.find({ "username": req.body.username }).toArray(function(err, results) {
            if (err) { return console.log(err) }

            let isFound = false;
            for (let i = 0; i < results.length; i++) {
                if (results[i].password === req.body.password) {
                    isFound = true
                    let token = jwt.sign({ username: results[i].username, role: results[i].role }, tokenKey, { expiresIn: "1h" })
                        // set cookies
                    res.cookie('token', token)
                    return res.redirect("/admin")
                }
            }

            return res.render("admin/login", { host: DOMAIN, error: "true" })

            //client.close();
        });
    });
})



router.get('/logout', checkAuth, (req, res) => {
    res.clearCookie("token")
    res.redirect("/")
})





module.exports = router;