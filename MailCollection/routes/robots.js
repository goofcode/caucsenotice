var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    "use strict";
    res.sendFile('robots.txt');
});
router.post('.', function(req, res, next){
    "use strict";
    res.sendFile('robots.txt');
});

module.exports = router;
