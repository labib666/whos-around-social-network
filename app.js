var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var index = require('./routes/index');
var signup = require('./routes/signup');
var login = require('./routes/login');
var logout = require('./routes/logout');
var dashboard = require('./routes/dashboard');
var user = require('./routes/user');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


/*
	Mongoose models for work (they are the tables/collections)
 */
var Schema = mongoose.Schema;
var users = mongoose.model('users', new Schema({ username: String, 
				email: String, password: String, api_token: String }), "users");
var status = mongoose.model('status', new Schema({ userId: Schema.Types.ObjectId, 
        status: String, timeCreated: Date, location: {longitude: Number, latitude: Number} }), "status");



// routers for use
app.use('/', index);
app.use('/users', users);
app.use('/signup', signup);
app.use('/login', login);
app.use('/dashboard', dashboard);
app.use('/logout', logout);
app.use('/user', user);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;
