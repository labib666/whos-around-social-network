var express = require('express');
var app = express()
var router = express.Router();
var bodyParser= require('body-parser')
var mongoose = require('mongoose');
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

            if (username == "" || email == "" || password == "") res.redirect('/signup');

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
        }
        
    });

});

module.exports = router;