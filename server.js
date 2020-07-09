var createError = require('http-errors');
var express     = require('express');
var path        = require('path');
var bodyParser  = require('body-parser');
var debug       = require('debug');
var http        = require('http');
var compression = require('compression');
var dotenv      = require('dotenv');
dotenv.config();

/*
* Import all the Routers
*/
var indexRouter     = require('./routes/indexRouter');
var bookRouter      = require('./routes/bookRouter');
var authorRouter    = require('./routes/authorRouter');
var categoryRouter  = require('./routes/categoryRouter');
var copyRouter      = require('./routes/copyRouter');

/*
* Set up mongoose connection
*/
var mongoose    = require('mongoose');
var mongoDB     = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var app = express();
app.use(express.static(path.join(__dirname,"public")));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('view engine', 'pug');

app.use(compression());

/*
* Implement all the Routing
*/

app.use('/book', bookRouter);
app.use('/author', authorRouter);
app.use('/category', categoryRouter);
app.use('/copy', copyRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
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

/**
* Get port from environment and store in Express.
*/

var port = process.env.PORT || '3000';
app.set('port', port);

/**
* Create HTTP server.
*/
var server = http.createServer(app);

/**
* Event listener for HTTP server "error" event.
*/

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
        case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
        default:
        throw error;
    }
}

/**
* Event listener for HTTP server "listening" event.
*/

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}


/**
* Listen on provided port, on all network interfaces.
*/

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);