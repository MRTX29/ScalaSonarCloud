var express = require('express');
var router = express.Router();

var {
  getIndex,
  getFavicon,
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  getLogout,
  postUpload,
  getFiles,
  deleteFile
} = require('./controllers/indexController');


router.get('/', getIndex);

router.get('/favicon.ico', getFavicon);

router.get('/login', getLogin);

router.post('/login', postLogin);

router.get('/register', getRegister);

router.post('/register', postRegister);

router.get('/logout', getLogout);

router.get('/user/files', getFiles);

router.delete('/removeFile/:name', deleteFile);

router.post('/upload', postUpload);

module.exports = router;
