var express = require('express');
var router = express.Router();
var config = require('config');
var url = require("url");
const fs = require("fs")
const multer = require("multer");
var checkAuth = require("./checkAuth").checkAuth


var DOMAIN = config.get('domain');

const rootdir = __dirname + "/../../"





// documents-storage
router.get('/documents-storage', checkAuth, (req, res) => {
    var storage_dir = rootdir + "storage/documents-storage/"

    fs.readdir(storage_dir, function(err, items) {
        var files = []
        if (items) {
            for (var i = 0; i < items.length; i++) {
                var file = {
                    "name": items[i],
                    "file": storage_dir + items[i],
                    "url": DOMAIN + "storage/documents-storage/" + items[i],
                }
                files.push(file)
            }
            res.render('admin/documents-storage', { host: DOMAIN, documents: files });
        } else {
            res.render('admin/documents-storage', { host: DOMAIN, documents: [] });
        }
    })
})



// add
router.post('/documents-storage/add', checkAuth, multer({ dest: "storage/documents-storage/" }).single("document"), (req, res) => {
    if (!req.file) {
        return res.redirect("/admin")
    }

    let photo = req.file;

    fs.rename(photo.path, photo.destination + photo.originalname, (err) => {
        if (err) throw err;
    });

    res.redirect("/admin")

})



// delete
router.get('/documents-storage/delete', checkAuth, (req, res) => {
    var filename = url.parse(req.url, true).query.filename

    if (!filename) {
        return res.redirect("/admin")
    }

    fs.unlink(rootdir + "storage/documents-storage/" + filename, (err) => {
        if (err) { return console.log(err) }
    })

    res.redirect("/admin")
})





module.exports = router;