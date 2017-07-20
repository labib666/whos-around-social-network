var express = require('express');
var router = express.Router();
var app = express();
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose')

app.use(cookieParser());

/* GET home page. */
router.get('/', function(req, res, next) {
  
  var api_token = req.cookies.api_token;
  console.log(req.cookies);

  var users = mongoose.model('users');
  users.count({ 'api_token': api_token }, function(err, ret) {
  	  if (err) console.error(err);
  	  if (ret === 0) {
	  	res.redirect('/login');
	  }
	  else {
	  	users.findOne({ 'api_token': api_token }, function(findError, user) {
	  		if (findError) console.error(findError);
	  		console.log( user.username );
		  	res.render('dashboard', {
		  		'title': 'Dashboard',
		  		'username': user.username
		  	})
		});
	  }
  });
  
  
});

module.exports = router;
