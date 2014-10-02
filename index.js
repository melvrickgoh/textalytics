var express = require('express'),
http = require('http'),
path = require('path'),
morgan = require('morgan'),
bodyParser = require('body-parser'),
methodOverride = require('method-override'),
cookie = require('cookie'),
cookieParser = require('cookie-parser'),
pg = require('pg.js'),
session = require('express-session'),
pgSession = require('connect-pg-simple')(session),
flash = require('connect-flash'),//allowing the flashing 

errorHandler = require('errorhandler'),
pgDAO = require('./server/dao/index');

var router = require('./server');

var app = express();

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

//general ROUTER
app.use('/', router.index);

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
