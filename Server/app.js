let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let moment = require('moment-timezone');
let fs = require('fs');

let indexRouter = require('./routes/index');
let session = require('./session')
let app = express();

app.disable('x-powered-by');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const logFilePath = path.join(__dirname, 'logs', 'requests.log');
const accessLogStream = fs.createWriteStream(logFilePath, { flags: 'a' });

logger.token('real-ip', (req) => {
  return req.headers['x-real-ip'];
});

app.use(logger((tokens, req, res) => {
  const date = moment().tz('Europe/Paris').format('HH:mm:ss.SSS DD:MM:YYYY');
  const ip = tokens['real-ip'](req, res);
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = tokens.status(req, res);
  const responseTime = tokens['response-time'](req, res);
  const contentLength = tokens.res(req, res, 'content-length');
  
  const logMessage = `${date} ${ip} ${method} ${url} ${status} ${responseTime} ms ${contentLength}`;
  console.log(logMessage);
  
  return logMessage;
}, { stream: accessLogStream }));

app.use(express.json({ limit: '1kb' }));
app.use(express.urlencoded({ extended: false, limit: '1kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.title = 'uhh, error?';

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});