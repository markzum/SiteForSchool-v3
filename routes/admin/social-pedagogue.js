var express = require('express');
var router = express.Router();
var mongo = require("mongodb");
var config = require('config');
var url = require("url");
const fs = require("fs");
const multer = require("multer");
var checkAuth = require("./checkAuth").checkAuth
var isSocialPedagogueOp = require("./checkAuth").isSocialPedagogueOp


const rootdir = __dirname + "/../../"
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
    "<i class=\"fa fa-phone fa-color\"></i>",
    "%domain%storage/"
]
const fa_abbr = ["%fa-word%",
    "%fa-powerpoint%",
    "%fa-pdf%",
    "%fa-excel%",
    "%fa-archive%",
    "%fa-youtube%",
    "%fa-external-link%",
    "%fa-phone%",
    "%url%"
]


// social-pedagogue
router.get('/social-pedagogue', checkAuth, isSocialPedagogueOp, (req, res) => {

    mongoClient.connect(function(err, client) {
        if (err) { return console.log(err) }
        const db = client.db("school");
        const collection = db.collection("pages");

        collection.find({ "pageName": "social-pedagogue" }).toArray(function(err, results) {
            if (err) { return console.log(err) }
            results = results[0]
            results.img = results.img.replace("%domain%storage/", "")
            results.text0 = replace_fa_i(results.text0)
            results.text1 = replace_fa_i(results.text1)
            results.text2 = replace_fa_i(results.text2)
            results.text3 = replace_fa_i(results.text3)
            results.text4 = replace_fa_i(results.text4)
            results.text5 = replace_fa_i(results.text5)

            var storage_dir = rootdir + "storage/"

            fs.readdir(storage_dir, function(err, items) {
                var files = []
                if (items) {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].split("_")[0] === "social-pedagogue") {
                            var file = {
                                "name": items[i],
                                "file": storage_dir + items[i],
                                "url": DOMAIN + "storage/" + items[i],
                                "type": items[i].split(".")[items[i].split(".").length - 1]
                            }
                            files.push(file)
                        }
                    }
                    res.render('admin/social-pedagogue', { host: DOMAIN, data: results, files: files });
                } else {
                    res.render('admin/social-pedagogue', { host: DOMAIN, data: results, files: [] });
                }
            })

            client.close();
        });
    });
})




router.post('/social-pedagogue/add-document', checkAuth, isSocialPedagogueOp, multer({ dest: "storage/" }).single("document"), (req, res) => {
    if (!req.file) {
        return res.redirect("/admin")
    }

    let document = req.file;

    if (document.originalname.split("_")[0] === "social-pedagogue") {
        fs.rename(document.path, document.destination + document.originalname, (err) => {
            if (err) throw err;
        });
    } else {
        fs.rename(document.path, document.destination + "social-pedagogue_" + document.originalname, (err) => {
            if (err) throw err;
        });
    }

    return res.redirect("/admin")
})




router.get('/social-pedagogue/delete-document', checkAuth, isSocialPedagogueOp, (req, res) => {
    var filename = url.parse(req.url, true).query.filename

    if (!filename) {
        return res.redirect("/admin")
    }

    if (!filename.split("_")[0] === "social-pedagogue") {
        return res.redirect("/admin")
    }

    fs.unlink(rootdir + "storage/" + filename, (err) => {
        if (err) { return console.log(err) }
    })

    res.redirect("/admin")
})





router.post('/social-pedagogue/update', checkAuth, isSocialPedagogueOp, (req, res) => {

    let name = req.body.name

    let img = req.body.img
    img = img.replace("%domain%storage/", "")
    img = "%domain%storage/" + req.body.img

    let text0 = replace_fa_abbr(req.body.text0)

    let title1 = req.body.title1
    let text1 = replace_fa_abbr(req.body.text1)

    let title2 = req.body.title2
    let text2 = replace_fa_abbr(req.body.text2)

    let title3 = req.body.title3
    let text3 = replace_fa_abbr(req.body.text3)

    let title4 = req.body.title4
    let text4 = replace_fa_abbr(req.body.text4)

    let title5 = req.body.title5
    let text5 = replace_fa_abbr(req.body.text5)


    mongoClient.connect(function(err, client) {
        if (err) { return console.log(err) }
        const db = client.db("school");
        const collection = db.collection("pages");

        var edit_page = {
            "name": name,
            "img": img,
            "text0": text0,
            "title1": title1,
            "text1": text1,
            "title2": title2,
            "text2": text2,
            "title3": title3,
            "text3": text3,
            "title4": title4,
            "text4": text4,
            "title5": title5,
            "text5": text5,

        }

        collection.updateOne({ "pageName": "social-pedagogue" }, { $set: edit_page }, (err, result) => {
            if (err) { return console.log(err) }
            //client.close();
        })
    });
    res.redirect("/admin")
})





function replace_fa_abbr(data) {
    for (let i = 0; i < fa_abbr.length; i++) {
        data = replace_all(fa_abbr[i], fa_i[i], data)
    }
    return data
}



function replace_fa_i(data) {
    for (let i = 0; i < fa_abbr.length; i++) {
        data = replace_all(fa_i[i], fa_abbr[i], data)
    }
    return data
}



function replace_all(find, replace, str) {
    var find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return str.replace(new RegExp(find, 'g'), replace);
}




module.exports = router;