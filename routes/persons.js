var express = require('express');
var router = express.Router();
var mongo = require("mongodb")
var url = require("url");
var config = require('config');


var DOMAIN = config.get('domain');
const MongoClient = mongo.MongoClient
const mongoClient = new MongoClient(config.get('db')) //mongodb://localhost:27017/


const fa_i = ["<i class=\"fa fa-file-word-o fa-word-color\"></i>",
    "<i class=\"fa fa-file-powerpoint-o fa-powerpoint-color\"></i>",
    "<i class=\"fa fa-file-pdf-o fa-pdf-color\"></i>",
    "<i class=\"fa fa-file-excel-o fa-excel-color\"></i>",
    "<i class=\"fa fa-file-archive-o fa-archive-color\"></i>",
    "<i class=\"fa fa-youtube-play fa-youtube-color\"></i>",
    "<i class=\"fa fa-external-link fa-external-link-color\"></i>",
    "<i class=\"fa fa-phone fa-color\"></i>"
]
const fa_abbr = ["fa-word", "fa-powerpoint", "fa-pdf", "fa-excel", "fa-archive", "fa-youtube", "fa-external-link", "fa_phone"]



//administration
router.get('/administration', (req, res) => {
    mongoClient.connect(function(err, client) {
        if (err) { return console.log(err) }
        const db = client.db("school");
        const collection = db.collection("persons");

        collection.find({ class: "administration" }).toArray(function(err, results) {
            if (err) { return console.log(err) }
            var sorted_results = results.sort(sortPersonsArray);
            for (var pers of sorted_results) {
                pers.img = pers.img.replace("%domain%", DOMAIN)
            }
            res.render('persons/administration', { host: DOMAIN, sectionTitle: "persons", persons: sorted_results });
            client.close();
        });
    });
});



//teachers
router.get('/teachers', (req, res) => {
    mongoClient.connect(function(err, client) {
        if (err) { return console.log(err) }
        const db = client.db("school");
        const collection = db.collection("persons");

        collection.find({ class: "teacher" }).toArray(function(err, results) {
            if (err) { return console.log(err) }
            var sorted_results = results.sort(sortPersonsArray);
            for (var pers of sorted_results) {
                pers.img = pers.img.replace("%domain%", DOMAIN)
            }
            res.render('persons/teachers', { host: DOMAIN, sectionTitle: "persons", persons: sorted_results });
            client.close();
        });
    });
});



//teachers-odod
router.get('/teachers-odod', (req, res) => {
    mongoClient.connect(function(err, client) {
        if (err) { return console.log(err) }
        const db = client.db("school");
        const collection = db.collection("persons");

        collection.find({ class: "teacher_odod" }).toArray(function(err, results) {
            if (err) { return console.log(err) }
            var sorted_results = results.sort(sortPersonsArray);
            for (var pers of sorted_results) {
                pers.img = pers.img.replace("%domain%", DOMAIN)
            }
            res.render('persons/teachers-odod', { host: DOMAIN, sectionTitle: "persons", persons: sorted_results });
            client.close();
        });
    });
});



//person's page
router.get('/person-page', (req, res) => {
    mongoClient.connect(function(err, client) {
        if (err) { return console.log(err) }
        const db = client.db("school");
        const collection = db.collection("persons");
        var id = url.parse(req.url, true).query.id
        if (id.length != 24) { return res.status(404).render('error-404', { host: DOMAIN }); }
        collection.find({ "_id": mongo.ObjectId(id) }).toArray(function(err, results) {
            if (err) { return console.log(err) }
            if (results[0]) {
                results[0].img = results[0].img.replace("%domain%", DOMAIN)

                res.render('persons/person-page', { host: DOMAIN, sectionTitle: "persons", person: results[0] });
            } else {
                res.status(404).render('error-404', { host: DOMAIN });
            }
            client.close();
        });
    });
});



router.get('/social-pedagogue', (req, res) => {
    mongoClient.connect(function(err, client) {
        if (err) { return console.log(err) }
        const db = client.db("school");
        const collection = db.collection("pages");
        collection.find({ "pageName": "social-pedagogue" }).toArray(function(err, results) {
            if (err) { return console.log(err) }
            results = results[0]

            results.img = results.img.replace("%domain%", DOMAIN)
            results.text0 = replace_domain(results.text0)
            results.text1 = replace_domain(results.text1)
            results.text2 = replace_domain(results.text2)
            results.text3 = replace_domain(results.text3)
            results.text4 = replace_domain(results.text4)
            results.text5 = replace_domain(results.text5)

            res.render('persons/social-pedagogue', { host: DOMAIN, data: results });
            client.close();
        });
    });
});



function sortPersonsArray(x, y) {
    return x.name.localeCompare(y.name);
}



function replace_domain(data) {
    return replace_all("%domain%", DOMAIN, data)
}



function replace_all(find, replace, str) {
    var find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return str.replace(new RegExp(find, 'g'), replace);
}




module.exports = router;