var express = require('express');
var router = express.Router();
var Auth = require('../middlewares/Auth');

router.get('/add/:username', Auth.getCurrentUser, function(req, res){
	res.send(req.params.username);
});

module.exports = router;
