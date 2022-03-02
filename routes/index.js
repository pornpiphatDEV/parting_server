var express = require('express');
var router = express.Router();
const db = require('../db/database')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});





router.get('/dashboard', function(req, res, next) {
  res.render('dashboard', { title: 'Express' });
});

router.get('/bookingreport', function(req, res, next) {
  res.render('bookingreport', { title: 'Express' });
});


router.get('/income', function(req, res, next) {
  res.render('income', { title: 'Express' });
});

router.get('/member', function(req, res, next) {
  res.render('member', { title: 'Express' });
});


router.get('/parkingreport', function(req, res, next) {
  res.render('parkingreport', { title: 'Express' });
});

router.get('/profilemember', function(req, res, next) {
  res.render('profilemember', { title: 'Express' });
});




module.exports = router;
