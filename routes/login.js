var express = require('express');
var router = express.Router();

/*
router.get('/', function(req, res, next) {
  //res.render('signup', { title: 'success', name: req.params[0] });
  console.log("signup");
  var name = JSON.stringify(req.param('name'));
  var email = JSON.stringify(req.param('email'));
  var password = JSON.stringify(req.param('password'));
  console.log(name+' '+email+' '+password);
  res.render('signup', { title: 'success', name: req.param('name'), email: req.param('email'), password: req.param('password') });
});
*/

router.post('/', function(req, res, next) {
  console.log("login");

  var email = JSON.stringify(req.param('Email'));
  var password = JSON.stringify(req.param('Password'));
  console.log(email+' '+password);

  res.json({ "success": "1", "cookie": "halum" });
});

module.exports = router;