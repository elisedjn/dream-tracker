require('dotenv').config();


const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');

// require database configuration
require('./configs/db.config');

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// Partials
hbs.registerPartials(__dirname + '/views/partials')

// Handlebars Date Setting
const moment = require('moment'); 
var DateFormats = {
  short: "DD MMM",
  long: "dddd DD.MM.YYYY"
};
hbs.registerHelper("formatDate", function(datetime, format) {
    if (moment) {
      format = DateFormats[format] || format;
      return moment(datetime).format(format);
    }
    else {
      return datetime;
    }
  });



// cookies and sessions
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
 
app.use(session({
    secret: 'myDream',
    name: 'dreamCookie',
    cookie: {
        maxAge: 60*60*24*1000 
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 60*60*24 
    })
}));

// Clear the session
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

const index = require('./routes/index.routes');
app.use('/', index);

const authRouter = require('./routes/auth.routes');
app.use('/', authRouter);

const privateRouter = require('./routes/private.routes');
app.use('/', privateRouter);



module.exports = app;
