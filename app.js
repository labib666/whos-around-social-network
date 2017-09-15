var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var csrf = require('csurf');

var app = express();

// Redirect HTTP to HTTPS on production server
if(process.env.NODE_ENV == 'production') {
	app.use(function(req, res, next){
		if(req.headers['x-forwarded-proto'] != 'https') {
			return res.redirect(['https://', req.get('Host'), req.url].join(''));
		}
		return next();
	});
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


// CSRF protection
var csrfProtection = csrf({cookie: true});

// routers for use
app.use('/', require('./routes/index'));
app.use('/signup', csrfProtection, require('./routes/signup'));
app.use('/login', csrfProtection, require('./routes/login'));
app.use('/verify', require('./routes/verify'));
app.use('/recover', csrfProtection, require('./routes/recover'));
app.use('/dashboard', csrfProtection, require('./routes/dashboard'));
app.use('/search', require('./routes/search'));
app.use('/user', require('./routes/user'));
app.use('/friends', require('./routes/friends'));
app.use('/logout', require('./routes/logout'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error("Page Not Found");
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
	res.render('pages/error');
});




module.exports = app;
