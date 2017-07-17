var express = require('express');
var router = express.Router();
var app = express();
var cookieParser = require('cookie-parser');

app.use(cookieParser());

/* GET home page. */
router.get('/', function(req, res, next) {
  
  req.cookies.api_token = "";

  res.render('index', { title: 'Who\'s Around' });
});

module.exports = router;
