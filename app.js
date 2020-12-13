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
const flash = require('connect-flash');
const schedule = require('node-schedule');
const passport = require('./config/passport-initialize');
const appSettings = require('./config/app-settings')
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

const PORT = process.env.PORT || 8080

// passport
app.use(session({
  secret: process.env.APP_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(timeLogger);

// set flash messages
app.use(flash());
app.use(function(req, res, next) {
  res.locals.messages = req.flash();
  next();
})

// global variable to determine login status
app.locals.signedIn = false;
app.locals.moment = moment;
app.locals.appSettings = appSettings;

// setting routes
router(app, tmpUpload)

app.set('view engine', 'pug')
app.set('views', './app/views')

app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/assets/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/assets/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/assets/socket.io-client', express.static(__dirname + '/node_modules/socket.io-client/dist'));
app.use('/assets/font-awesome/css', express.static(__dirname + '/node_modules/font-awesome/css'));
app.use('/assets/font-awesome/fonts', express.static(__dirname + '/node_modules/font-awesome/fonts'));
app.use('/assets/bootstrap-daterangepicker', express.static(__dirname + '/node_modules/bootstrap-daterangepicker'));
app.use('/assets/moment', express.static(__dirname + '/node_modules/moment/dist'));
app.use('/assets/noty', express.static(__dirname + '/node_modules/noty/lib'));
app.use('/assets/select2', express.static(__dirname + '/node_modules/select2/dist'));
app.use('/assets/vue', express.static(__dirname + '/node_modules/vue/dist'));
app.use('/assets/chart.js', express.static(__dirname + '/node_modules/chart.js/dist'));
app.use('/assets/datatables.net', express.static(__dirname + '/node_modules/datatables.net'));
app.use('/assets/datatables.net-bs4', express.static(__dirname + '/node_modules/datatables.net-bs4'));


// io
io.on('connection', function(socket) {
  console.log(`[${moment()}] [socket.io] a user connected`);
  // socket.emit('nodeEventUpdate', 1232222)
  socket.on('disconnect', function() {
    console.log(`[${moment()}] [socket.io] user disconnected`);
  });
  socket.on('nodeOnSavingUpdate', function(msg) {
    socket.broadcast.emit('nodeStatusUpdate', msg)
  })
})

server.listen(PORT, function() {
  console.log(`Server started at Port ${PORT}`)
})
