var express = require('express');
var router = express.Router();
var auth = require('../middlewares/authenticate');

/* GET home page. */
router.get('/', function(req, res, next) {
	auth.getLoggedInUser(req, function(err, email){
		if(err) console.error(err);
		
		if (email) {
			res.redirect('/dashboard');
		}
		else {
    		res.render('index', { title: 'Who\'s Around' });
    	}
    });
});

module.exports = router;
