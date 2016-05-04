var express = require('express');
var router = express.Router();
var request = require('request');

var vkapi = require('../socials/vkapi');
var googleapi = require('../socials/googleapi');

router.get('/vkontakte', function(req, res, next) {

    var hostaname = req.protocol+'://'+req.get('host');

    if (req.query.code) {
        vkapi.auth(req.query.code, hostaname).then(function(result) {

            result = JSON.parse(result);

            var exp = new Date();
            exp.setSeconds(exp.getSeconds() + result.expires_in);
            res.cookie('vkontakte', JSON.stringify(result), {expires: exp, httpOnly: false, domain: req.hostname});

            var success = "<script>"
                + "(function() {"
                    + "window.close();"
                    + "window.location.href='"+hostaname+"';"
                + "})();"
                + "</script>";
            res.send(success);
            res.redirect('/');
        });
    }
    else {
        res.clearCookie('vkontakte');
        res.send(vkapi.codeLink(hostaname));
    }
});


router.get('/google', function(req, res, next) {

    var hostaname = req.protocol+'://'+req.get('host');

    if (req.query.code) {
        googleapi.auth(req.query.code).then(function(result) {

            var exp = new Date();
            exp.setSeconds(exp.getSeconds() + result.expiry_date);
            res.cookie('google', JSON.stringify(result), {expires: exp, httpOnly: false, domain: req.hostname});

            var success = "<script>"
                + "(function() {"
                    + "window.close();"
                    + "window.location.href='"+hostaname+"';"
                + "})();"
                + "</script>";
            res.send(success);
            res.redirect('/');

        });
    }
    else {
        res.clearCookie('google');
        res.send(googleapi.codeLink(hostaname));
    }

});

module.exports = router;
