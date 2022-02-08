var express = require('express');
var router = express.Router();
var config = require('config');
var url = require("url");
const fs = require("fs")
const multer = require("multer");
var checkAuth = require("./checkAuth").checkAuth
var isPersonsOp = require("./checkAuth").isPersonsOp


var DOMAIN = config.get('domain');

const rootdir = __dirname + "/../../"





// persons-storage
router.get('/persons-storage', checkAuth, isPersonsOp, (req, res) => {
    var storage_dir = rootdir + "storage/"

    fs.readdir(storage_dir, function(err, items) {
        var files = []
        if (items) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].split("_")[0] === "persons-storage") {
                    var file = {
                        "name": items[i],
                        "file": storage_dir + items[i],
                        "url": DOMAIN + "storage/" + items[i],
                    }
                    files.push(file)
                }
            }
            res.render('admin/persons-storage', { host: DOMAIN, files: files });
        } else {
            res.render('admin/persons-storage', { host: DOMAIN, files: [] });
        }
    })
})



// add
router.post('/persons-storage/add', checkAuth, isPersonsOp, multer({ dest: "storage/" }).single("photo"), (req, res) => {
    if (!req.file) {
        return res.redirect("/admin")
    }

    let photo = req.file;

    if (photo.originalname.split("_")[0] === "persons-storage") {
        fs.rename(photo.path, photo.destination + photo.originalname, (err) => {
            if (err) throw err;
        });
    } else {
        fs.rename(photo.path, photo.destination + "persons-storage_" + photo.originalname, (err) => {
            if (err) throw err;
        });
    }

    res.redirect("/admin")

})



// delete
router.get('/persons-storage/delete', checkAuth, isPersonsOp, (req, res) => {
    var filename = url.parse(req.url, true).query.filename

    if (!filename) {
        return res.redirect("/admin")
    }

    if (!filename.split("_")[0] === "persons-storage") {
        return res.redirect("/admin")
    }

    fs.unlink(rootdir + "storage/" + filename, (err) => {
        if (err) { return console.log(err) }
    })

    res.redirect("/admin")
})





module.exports = router;