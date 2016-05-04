var express = require('express');
var router = express.Router();
var vkapi = require('../socials/vkapi');

/* GET home page. */
router.get('/', function(req, res, next) {

    if (!req.cookies.vkontakte)
        return res.sendStatus(401);

    var auth = JSON.parse(req.cookies.vkontakte);

    vkapi.get('users.get', {'user_ids': auth.user_id, 'fields': 'photo_50'}, auth.access_token)
        .then(function (result) {
            res.send(result[0]);
        });


});

module.exports = router;
