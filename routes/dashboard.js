var express = require('express');
var router = express.Router();
var app = express();
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var auth = require('../middlewares/authenticate');


app.use(cookieParser());


router.get('/', function(req, res, next) {
  
    var api_token = req.cookies.api_token;
    console.log(req.cookies);

    var users = mongoose.model('users');
    auth.getLoggedInUser(req, function(err, email){
    	if (err) console.error(err);

   		console.log('dashboard ' + typeof email);

	    if (email) {
		  	users.findOne({ 'api_token': api_token }, function(findError, user) {
		  		if (findError) console.error(findError);
		  		console.log( user );
			  	res.render('dashboard', {
			  		'title': 'Dashboard',
			  		'username': user.username
			  	})
			});
	    }
		else {
		  	res.redirect('/login');
		}
	});
});
  

module.exports = router;
