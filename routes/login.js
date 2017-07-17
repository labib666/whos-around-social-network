var express = require('express');
var router = express.Router();
var app = express()
var bodyParser= require('body-parser')
var MongoClient = require('mongodb').MongoClient
var randomstring = require("randomstring")

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

  var db = req.db;
  var users = db.get('users');

  users.count(
	  {
	  	"email": email
	  }
  ).then ( function(ret) {

  		console.log(ret);

	  if (ret === 0) {
	  	console.log("invalid email");
	  	res.redirect('/login');
	  }

	  else {
		  users.findOne(
			  {
			  	"email": email
			  }
		  ).then( function(ret2){
		  	console.log("here " + ret2 );

		  	a = ret2;

			  if (a.password != password) {
			  	console.log("invalid password " + a.password, password);
		  		res.redirect('/login');
			  }
			  else {
			  	console.log("successful signin");

			  	a.api_token = randomstring.generate(50);
			  	users.insert(a);

			  	/// set cookie here
			  	res.cookie('userId', a._id);
			  	res.cookie('api_token', a.api_token);

			  	res.redirect('/dashboard');
			  }
		  } );
		}
	  
    });

});

module.exports = router;