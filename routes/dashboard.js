var express = require('express');
var router = express.Router();
var app = express();
var cookieParser = require('cookie-parser');

app.use(cookieParser());

/* GET home page. */
router.get('/', function(req, res, next) {
  
  var userId = req.cookies.userId;
  var api_token = req.cookies.api_token;

  var db = req.db;
  var users = db.get('users');

  var now = users.count({ 'api_token': api_token });
  if (now == 0) {
  	res.redirect('/login');
  }
  else {
  	res.render('dashboard', {
  		title: 'Dashboard',
  		userId: now.userId
  	});
  }
  
});

module.exports = router;
