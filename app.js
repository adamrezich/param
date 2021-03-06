var express = require('express.io');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var param = require('./param.js');

var app = express();

app.http().io();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.session({secret: 'super-secret'}));

//app.use('/', routes);
//app.use('/users', users);

app.get('/', function(req, res) {
  req.session.loginDate = new Date().toString();
  res.render('index.jade');
});


app.io.route('ready', function(req) {
  //req.session.name = req.data;
  req.session.user = new param.User();
  req.session.save(function() {
    req.io.route('init');
  });
});


app.io.route('init', function(req) {
  req.session.user.addBlock(0, 0, 1, 1, req.io, { active: true });
  req.session.save(function() {
    req.io.route('get-stats');
  });
});


// Send back the session data.
app.io.route('get-stats', function(req) {
  req.io.emit('stats', req.session.user.stats);
});

app.io.route('click-block', function(req) {
  if (!req.session || !req.session.user)
    return;
  if (req.session.user.board.blocks.indexOf(req.data)) {
    var block = req.session.user.board.blocks[req.data];
    block.click(req.session.user);
    if (block.progress == 100 && req.session.user.board.blocks.length == block.id + 1) {
      req.session.user.addBlock(block.pos.x + block.dims.x, 0, block.id + 2, 1, req.io, { active: true });
    }
    req.session.save(function() {
      req.io.emit('click-block',
      {
        block: req.session.user.board.blocks[req.data],
        stats: req.session.user.stats
      });
    });
  }
});




/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

// DEBUG=param nodemon app.js
// npm start