var express = require('express');
var mongoose = require('mongoose');
var parser = require('xml2json');
var xmlParser = require('express-xml-bodyparser');
var app = express();
var router = express.Router();
var port = process.env.PORT || 8080;
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var TICKETS_COLLECTION = "tickets";
var ObjectID = mongodb.ObjectID;
var db = require('./config/key').mongoURI;
var js2xmlparser = require("js2xmlparser");
var fetch = require("node-fetch");
var request = require('request');

var options = {
  object: false,
  reversible: true,
  coerce: false,
  sanitize: true,
  trim: true,
  arrayNotation: false,
  alternateTextNode: false
};

// connect to mongoDB
mongoose
  .connect(db)
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch(err => {
    console.log(err);
    console.log('MongoDB Not Connected');
  });

  //create model based on ticketSchema
let TicketModel = require('./ticket')

// routes
app.get('/', function(req, res){
  res.send("Hello world");
});    

router.get('/list', function(req, res){
  TicketModel.find(function(err, tickets) {
    if (err) return console.error(err);
    res.status(200).send(tickets)
  });
});

router.get("/tickets/:id", function(req, res) {
 TicketModel.find({
   employeenum: req.params.id
 }, function(err, obj) { res.send(obj[0])})
});


//XML Adapter for Method: GET
router.get("/xml/tickets/:id", async function(req, res) {
  var url = "https://sievers-phase3.herokuapp.com/rest/tickets/" + req.params.id;
  fetch(url)
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      console.log(json);
      return json;
    })
    .then(function(json){
      var xml = js2xmlparser.parse("TicketModel", json);
      return xml;
    })
    .then(function(xml){
      console.log(xml);
      var sendxml = "<textarea rows=\"20\" cols=\"40\" style=\"border:none;\">" + xml + "</textarea>";
      res.send(sendxml);
    })
    .catch(err => {
      console.error(err);
      res.status(404).send(err);
    })
});

router.post("/tickets/", function(req,res) {
  var addTicket = new TicketModel(req.body);

  console.log(req.body);

  addTicket.save()
  .then(obj => {
    res.send(req.body)})
  .catch(err => {
  res.status(400).send("Failure to POST")})});

router.put("/tickets/:id", function(req, res) {
  TicketModel.findOneAndUpdate({employeenum: req.params.id }, req.body, function(err){
    if (err) res.send(err)
    else res.status(200).send(req.body);
  })
});

//  XML adapter for Method: PUT
router.put('/xml/tickets/:id', xmlParser(), function(req, res, next) {
  var url = "https://sievers-phase3.herokuapp.com/rest/tickets/" + req.params.id;
  let m = req.body;
  let obj = {};
  for (let a in m.ticketmodel) {
    obj[a] = m.ticketmodel[a][0];
  }
  console.log("XML Body received: ")
  console.log(obj);

  request.put({
    url: url,
    form: {
      _id: m.ticketmodel._id[0],
      name: m.ticketmodel.name[0],
      issue: m.ticketmodel.issue[0],
      employeenum: m.ticketmodel.employeenum[0],
      __v: m.ticketmodel.__v[0]
    }
  }, function(error, response, body) {
    console.log(request.form);
  });
  res.status(200).send(obj);  
});

router.delete("/tickets/:id", function(req, res) {
  TicketModel.findOneAndDelete({employeenum: req.params.id }, req.body, function(err){
    if (err) res.send(err)
    else res.status(200).send(req.body);
  })
});

//express.use() 
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use('/rest', router);
app.use('/api/ticket/:id', router);

app.listen(port, () => console.log("The server is up and running"));