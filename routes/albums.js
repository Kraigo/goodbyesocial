var express = require('express');
var router = express.Router();
var vkapi = require('../socials/vkapi');

/* GET home page. */
router.get('/', function(req, res, next) {

    if (!req.cookies.vkontakte)
        return res.sendStatus(401);

    var auth = JSON.parse(req.cookies.vkontakte);

    vkapi.get('photos.getAlbums', {
        'owner_id': auth.user_id,
        'need_covers': 1,
        'need_system': 1
    }, auth.access_token)

        .then(function (result) {
            res.send(result)
        })

});

module.exports = router;
