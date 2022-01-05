var express = require('express')
var app = express()
var mongo = require("mongodb")
var url = require("url");
var config = require('config');
var persons = require('./routes/persons');
var admin = require('./routes/admin');
var nodemailer = require('nodemailer')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')



var HOST = config.get('host'); // http://localhost  192.168.10.153
var PORT = config.get('port');
var DOMAIN = config.get('domain');
var sender_email = config.get('sender_email');
var sender_pass = config.get('sender_pass');
const MongoClient = mongo.MongoClient
const mongoClient = new MongoClient(config.get('db')) //mongodb://localhost:27017/

const urlencodedParser = bodyParser.urlencoded({extended: false,})

app.use('/static', express.static(__dirname + '/public')); //'static' is just url prefix

app.set('view engine', 'pug');

app.use(cookieParser())





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





//import other files
//persons
app.use('/persons', persons);
//admin
app.use('/admin', admin);





//feedback
app.post('/feedback', urlencodedParser, (req, res) => {
    if (!req.body) return res.sendStatus(400)
    var name = req.body.name
    var email = req.body.email
    var recipient = req.body.recipient
    var subject = req.body.subject
    var text = req.body.text

    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: sender_email,
          pass: sender_pass
        }
    });

    var to;
    switch (recipient){
        case "meshcheryakov":
            to = 'markzum@yandex.ru'
            break
        case "dementieva":
            to = 'markzum@yandex.ru'
            break
    }
    
    let result = transporter.sendMail({
      from: `Школа №163 <${sender_email}>`,
      to: to,
      subject: subject,
      html: "<strong>Сообщение от:</strong> " + name + "<br><strong>Email:</strong> " + email + "<br><br>" + text,
    })
    
    res.render('success-feedback', {host: DOMAIN, sectionTitle: "success-feedback"})
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