var express = require('express');
var router = express.Router();
var app = express();
var bodyParser= require('body-parser');
var randomstring = require("randomstring")
var mongoose = require('mongoose');
var User = require('../models/User');
var auth = require('../middlewares/authenticate');

app.use(bodyParser.urlencoded({extended: true}));


router.get('/', function(req, res, next) {
    auth.getLoggedInUser(req, function(err, email){
        if(err) console.error(err);

        if (email) {
            res.redirect('/dashboard');
        }
        else {
            res.render('signup', { title: 'Sign up' });
        }
    });
})


router.post('/', function(req, res, next) {
    console.log("here to signup new user");

    auth.getLoggedInUser(req, function(err, Email){
        if (err) console.error(err);

        if (Email) {
            res.redirect('/dashboard');
        }
        else {
            console.log(req.body);

            var username = req.body.username;
            var email = req.body.email;
            var password = req.body.password;

            if (username == "" || email == "" || password == "") {
                res.redirect('/signup');
            }
            else {
            
              //console.log(username + ' ' + email + ' ' + password);

              User.count(  { "email": email }, function (err, result) {

                  var fail = 0;

                  if (err) console.error(err);
                  console.log("number of id with this email: " + result);

                  if (result === 0) { // unique email

                      user = new User({
                        'username' : username,
                        'email': email,
                        'password': password,
                        'api_token': randomstring.generate(50)
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
          }
      }
        
    });

});

module.exports = router;