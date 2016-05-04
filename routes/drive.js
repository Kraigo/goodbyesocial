var express = require('express');
var router = express.Router();

var googleapi = require('../socials/googleapi');

router.get('/', function(req, res, next) {

    var auth = JSON.parse(req.cookies.google);

    googleapi.drive(auth).files.list({}, function (err, respose) {
        res.send(respose);
    });
    //googleapi.plus(auth).people.get({ userId: "me" }, function (err, respose) {
    //    res.send(respose);
    //});

});

module.exports = router;
