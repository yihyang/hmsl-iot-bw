const express = require('express')
const multer  = require('multer')
const router = require('./app/router')
const tmpUpload = multer({ dest: 'tmp/uploads/' });
const path = require('path')
const http = require('http')
const socketIo = require('socket.io')
const bodyParser = require('body-parser');
const moment = require('moment');
const session = require('express-session');
const schedule = require('node-schedule');
const passport = require('./config/passport-initialize');
const {
  timeLogger
} = require('./app/helpers/express');

require('dotenv').config()

// ADDED prefix feature
express.application.prefix = express.Router.prefix = function(path, configure) {
  var router = express.Router();
  this.use(path, router);
  configure(router);
  return router;
};

const app = express()
const server = http.createServer(app)
const io = socketIo(server);

const APP_PORT_NUMBER = process.env.APP_PORT_NUMBER || 8080

// passport
app.use(session({
  secret: process.env.APP_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(timeLogger);

// POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// global variable to determine login status
app.locals.signedIn = false;

// setting routes
router(app, tmpUpload)

app.set('view engine', 'pug')
app.set('views', './app/views')

app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/assets/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/assets/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/assets/socket.io-client', express.static(__dirname + '/node_modules/socket.io-client/dist'));
app.use('/assets/font-awesome/css', express.static(__dirname + '/node_modules/font-awesome/css'));
app.use('/assets/font-awesome/fonts', express.static(__dirname + '/node_modules/font-awesome/fonts'));
app.use('/assets/bootstrap-daterangepicker', express.static(__dirname + '/node_modules/bootstrap-daterangepicker'));
app.use('/assets/moment', express.static(__dirname + '/node_modules/moment/dist'));
app.use('/assets/noty', express.static(__dirname + '/node_modules/noty/lib'));


// io
io.on('connection', function(socket) {
  console.log(`[${moment()}] [socket.io] a user connected`);
  socket.emit('nodeEventUpdate', 1232222)
  socket.on('disconnect', function() {
    console.log(`[${moment()}] [socket.io] user disconnected`);
  });
  socket.on('nodeOnSavingUpdate', function(msg) {
    socket.broadcast.emit('nodeStatusUpdate', msg)
  })
})

server.listen(APP_PORT_NUMBER, function() {
  console.log(`Server started at Port ${APP_PORT_NUMBER}`)
})
