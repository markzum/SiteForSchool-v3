var express = require('express')
var app = express()
var mongo = require("mongodb")


var HOST = 'http://localhost' //192.168.10.153
var PORT = 3000
var URL = HOST + ":" + PORT
const MongoClient = mongo.MongoClient
const mongoClient = new MongoClient("mongodb+srv://markzum:163schoolTOP1@cluster0.gm56v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority") //mongodb://localhost:27017/

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
            res.render('index', {host: URL, sectionTitle: "index", alerts: results});
            client.close();
        });
    });
});



//administration
app.get('/persons/administration', (req, res) => {
    mongoClient.connect(function(err, client){
        if (err) {return console.log(err)}
        const db = client.db("school");
        const collection = db.collection("persons");
    
        collection.find({class: "administration"}).toArray(function(err, results){
            if (err) {return console.log(err)}
            var sorted_results = results.sort(sortPersonsArray);
            res.render('administration', {host: URL, sectionTitle: "persons", persons: sorted_results});
            client.close();
        });
    });
});



//teachers
app.get('/persons/teachers', (req, res) => {
    mongoClient.connect(function(err, client){
        if (err) {return console.log(err)}
        const db = client.db("school");
        const collection = db.collection("persons");
    
        collection.find({class: "teacher"}).toArray(function(err, results){
            if (err) {return console.log(err)}
            var sorted_results = results.sort(sortPersonsArray);
            res.render('teachers', {host: URL, sectionTitle: "persons", persons: sorted_results});
            client.close();
        });
    });
});



//person's page
app.get('/persons/page*', (req, res) => {
    mongoClient.connect(function(err, client){
        if (err) {return console.log(err)}
        const db = client.db("school");
        const collection = db.collection("persons");
        collection.find({"_id": mongo.ObjectId(req.url.replace('/persons/page', ''))}).toArray(function(err, results){
            if (err) {return console.log(err)}
            res.render('person-page', {host: URL, sectionTitle: "persons", person: results[0]});
            client.close();
        });
    });
});



// 404
app.use(function(req, res, next) {
    res.status(404).render('error-404', {host: URL});
});



app.listen(PORT, () => {
    console.log(`Example app listening at ${HOST}:${PORT}`)
})



function sortPersonsArray(x, y){
    return x.name.localeCompare(y.name);
}