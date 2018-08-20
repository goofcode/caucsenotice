var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    "use strict";
    res.render('unsubscribe', { title: 'CAUCSE Notice' });
});

module.exports = router;
