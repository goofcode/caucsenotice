var fs = require('fs');
var express = require('express');
var winston = require('winston');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'CAUCSE Notice' });
});

router.post('/', function(req, res, next) {
    var filename = '../data/mailingList.txt';
    var regex=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
    if(regex.test(req.body.email)===false){
        logger.log('error', req);
        return;
    }
    var textData = fs.readFileSync(filename).toString();
    var emailList = textData.split('\n').filter(String);
    var index = emailList.indexOf(req.body.email);
    if(index>-1){
        emailList.splice(index,1);
    }
    fs.writeFileSync(filename, emailList.join('\n'));
    res.send("HI");
});
module.exports = router;