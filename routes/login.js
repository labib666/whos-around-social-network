var express = require('express');
var router = express.Router();
var app = express()
var bodyParser= require('body-parser')
var MongoClient = require('mongodb').MongoClient

app.use(bodyParser.urlencoded({extended: true}));

router.get('/', function(req, res, next) {
	console.log("here at login");
	res.render('login', { title: 'Log in' });
})

router.post('/', function(req, res, next) {
  console.log("login post method");

  console.log(req.body);

  var email = req.body.email;
  var password = req.body.pass;

  res.json({ "success": "1", "cookie": "halum" });
});

module.exports = router;