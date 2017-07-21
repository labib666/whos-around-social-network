var express = require('express');
var router = express.Router();
var app = express();
var cookieParser = require('cookie-parser');


app.use(cookieParser());


router.get('/', function(req, res, next) {
  
  res.cookie('api_token', "");

  res.redirect('/');
});

module.exports = router;
