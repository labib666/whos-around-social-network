var express = require('express');
var router = express.Router();
var app = express();
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var User = require('../models/User');
var Auth = require('../middlewares/Authenticate');

app.use(cookieParser());
router.use(Auth.getLoggedInUser);

router.get('/', function(req, res, next) {
	if (req.user) {
		res.render('pages/dashboard', {
			'title': "Dashboard",
			'username': req.user.username
		  });
	}
	else {
		res.redirect('/login');
	}
});


// function to pass to array.sort() to sort array based on an attribute
// eg. yourArray.sort( predicateBy("age") );
function predicateBy(prop){
   return function(a,b){
	  if( a[prop] > b[prop]){
		  return 1;
	  }else if( a[prop] < b[prop] ){
		  return -1;
	  }
	  return 0;
   }
}

module.exports = router;
