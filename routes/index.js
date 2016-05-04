var express = require('express');
var router = express.Router();
var vkapi = require('../socials/vkapi');

/* GET home page. */
router.get('/', function(req, res, next) {

    var auth = null;
    var user = {};
    var albums = [];
    var photos = [];

    console.log('Cookie vkontakte:', !!req.cookies.vkontakte);

    if (req.cookies.vkontakte) {

        auth = JSON.parse(req.cookies.vkontakte);

        vkapi.token = auth.access_token;

        getUser()
            .then(function() {

                return getAlbums();
            })
            //.then(function() {
            //    return getPhotos('wall')
            //})
            //.then(function() {
            //    return getPhotos('profile')
            //})
            //.then(function() {
            //    return getPhotos('saved')
            //})
            .then(function() {
                res.render('index', {
                    user: user,
                    albums: JSON.stringify(albums),
                    photos: JSON.stringify(photos)
                });
            });

    } else {

        res.render('index', {
            oauthlink: vkapi.codeLink()
        });
    }

    function getUser() {
        return vkapi.get('users.get', {'user_ids': auth.user_id, 'fields': 'photo_50'})
            .then(function (result) {
                user = result[0];
            });
    }

    function getAlbums() {
        return vkapi.get('photos.getAlbums', {'owner_id': auth.user_id, 'need_covers': 1})
            .then(function (result) {
                albums = albums.concat(result);
            });
    }

    function getPhotos(id, offset) {
        offset = offset || 0;
        return vkapi.get('photos.get', {'owner_id': auth.user_id, 'album_id': id, offset: offset})
            .then(function (result) {
                photos = albums.concat(result);
            });
    }


});

module.exports = router;
