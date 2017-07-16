var express = require('express');
var app = express()
var router = express.Router();
var bodyParser= require('body-parser')
var MongoClient = require('mongodb').MongoClient

app.use(bodyParser.urlencoded({extended: true}));

router.get('/', function(req, res, next) {
  res.render('signup', { title: 'Sign up' });
})


router.post('/', function(req, res, next) {
  console.log("here to signup new user");

  console.log(req.body);

  var userId = req.body.userId;
  var email = req.body.email;
  var password = req.body.pass;
  
  //console.log(userId + ' ' + email + ' ' + password);

  MongoClient.connect(process.env.DB_URI, function (err, db) {
    if (err) console.error(err);

    db.collection('users').count( { "email": email }, function (err, result) {

      var fail = 0;

      if (err) console.error(err);
      console.log("number of id with this email: " + result);

      if (result === 0) { // unique email
        db.collection('users').insert ({
            "user": userId,
            "email": email,
            "password": password
        }, function (err, result) {
            if (err) console.error(err);
            console.log(result);
        })
      }

      else {              // noshto email
        fail = 1;
        console.log("email already in use");
      }

      db.close(function(err,result){
        if (err) console.error(err);
      });

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

})

module.exports = router;