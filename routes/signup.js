var express = require('express');
var app = express()
var router = express.Router();
var bodyParser= require('body-parser')
var mongoose = require('mongoose');

app.use(bodyParser.urlencoded({extended: true}));


router.get('/', function(req, res, next) {
  res.render('signup', { title: 'Sign up' });
})


router.post('/', function(req, res, next) {
  console.log("here to signup new user");

  console.log(req.body);

  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;

  var users = mongoose.model('users');

  
  //console.log(username + ' ' + email + ' ' + password);

  users.count(  { "email": email }, function (err, result) {

    var fail = 0;

    if (err) console.error(err);
    console.log("number of id with this email: " + result);

    if (result === 0) { // unique email

      user = new users({
        "username" : username,
        "email": email,
        "password": password
      });

      user.save(function (saveErr, updatedUser) {
        if (saveErr) console.error(saveErr);
        console.log(result);
      });
    }

    else {              // noshto email
      fail = 1;
      console.log("email already in use");
    }

    console.log("fail = " + fail);

    if (fail === 1) {
      console.log("redirecting to signup");
      res.redirect('/signup');
    }
    else {
      console.log("signup successful. redirecting to login");
      res.redirect('/login');
    }

  });

})

module.exports = router;