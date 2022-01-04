var express = require('express')
var app = express()
var mongo = require("mongodb")
var url = require("url");
var config = require('config');
var persons = require('./persons');
var nodemailer = require('nodemailer')


var HOST = config.get('host'); // http://localhost  192.168.10.153
var PORT = config.get('port');
var DOMAIN = config.get('domain');
const MongoClient = mongo.MongoClient
const mongoClient = new MongoClient(config.get('db')) //mongodb://localhost:27017/

app.use('/static', express.static(__dirname + '/public')); //'static' is just url prefix
app.use('/dist', express.static(__dirname + '/dist'));

app.set('view engine', 'pug');



// index
app.get('/', (req, res) => {
    mongoClient.connect(function(err, client){
        if (err) {return console.log(err)}
        const db = client.db("school");
        const collection = db.collection("alerts");
    
        collection.find().toArray(function(err, results){
            if (err) {return console.log(err)}
            /* 'index' instead of 'index.pug' because of 'app.set('view engine', 'pug')' */
            res.render('index', {host: DOMAIN, sectionTitle: "index", alerts: results});
            client.close();
        });
    });
});



//persons
app.use('/persons', persons);



//feedback
app.get('/feedback', (req, res) => {
    var name = url.parse(req.url, true).query.name
    var email = url.parse(req.url, true).query.email
    var recipient = url.parse(req.url, true).query.recipient
    var subject = url.parse(req.url, true).query.subject
    var text = url.parse(req.url, true).query.text

    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "Lutchshiispiner@gmail.com",
          pass: "zopapopa"
        }
    });

    var to;
    switch (recipient){
        case "MarkMeshcheryakov":
            to = 'markzum@yandex.ru'
            break
    }
    
    let result = transporter.sendMail({
      from: 'Школа №163 <Lutchshiispiner@gmail.com>',
      to: to,
      subject: subject,
      html: "<strong>Сообщение от:</strong> " + name + "<br><strong>Email:</strong> " + email + "<br><br>" + text,
    })
    
    res.redirect('/')
});



// search
app.get('/search', (req, res) => {
    var q = url.parse(req.url, true).query.q
    if (q){
        mongoClient.connect(function(err, client){
            if (err) {return console.log(err)}
            const db = client.db("school");
            const collection1 = db.collection("search");
            var searchList = []
            collection1.find({ $text: { $search: q } }).toArray(function(err, results1){
                if (err) {return console.log(err)}
                searchList.push(results1)
                const collection2 = db.collection("persons");
                collection2.find({ $text: { $search: q } }).toArray(function(err, results2){
                    searchList.push(results2)
                    if (!(searchList[0][0] || searchList[1][0])) {
                        searchList = 'no'
                    }
                    res.render('search', {host: DOMAIN, sectionTitle: "search", searchList: searchList, q: q});
                    client.close();
                });
            });
        
        });
    } else {
        res.render('search', {host: DOMAIN, sectionTitle: "search"})
    }
});



// 404
app.use(function(req, res, next) {
    res.status(404).render('error-404', {host: DOMAIN});
});



app.listen(PORT, () => {
    console.log(`Example app listening at ${HOST}:${PORT}`)
})