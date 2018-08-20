var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var helmet = require('helmet');

var index = require('./routes/index');
var users = require('./routes/users');
var sendMail = require('./routes/sendEmail');
var robots = require('./routes/robots');
var unsubscribe = require('./routes/unsubscribe');
var removeEmail = require('./routes/removeEmail');
var agree = require('./routes/agree');

var app = express();
app.use(helmet());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
app.use(logger('combined', {
    stream: accessLogStream,
    skip: function(req,res){
        "use strict";
        return res.statusCode < 400;
    }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/sendEmail', sendMail);
app.use('/robots.txt', robots);
app.use('/unsubscribe', unsubscribe);
app.use('/removeEmail', removeEmail);
app.use('/agree', agree);

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
