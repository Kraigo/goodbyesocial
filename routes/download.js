'use strict';

var express = require('express');
var router = express.Router();
var vkapi = require('../socials/vkapi');
var archiver = require('archiver');
var request = require('request');

/* GET home page. */
router.get('/', function (req, res, next) {


    if (!req.cookies.vkontakte)
        return res.sendStatus(401);


    var auth = JSON.parse(req.cookies.vkontakte);

    var photos = [];
    var zip = archiver.create('zip', {});

    res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-disposition': 'attachment; filename=Photos.zip'
    });

    zip.pipe(res);


    getAlbums(req.query.albums).then(function(result) {

        let chain = Promise.resolve();

        result.forEach(function(album) {
            chain = chain
                .then(function(){
                    return getPhotos(album.aid);
                })
                .then(function(result) {
                    var albumName = album.title.replace(/[^a-zA-Zа-яА-Я0-9_-\s]/g, '').replace(/(^\s+)|(\s+$)/g, '');
                    return loadPhoto(result, albumName);
                });
        });

        chain.then(function() {
            zip.finalize();
        })

    });



    function getAlbums(ids) {

        ids = '1,'+ids;

        return vkapi.get('photos.getAlbums', {
            'owner_id': auth.user_id,
            'album_ids': ids || null
        }, auth.access_token);
    }


    function getPhotos(id) {
        return vkapi.get('photos.get', {
            'owner_id': auth.user_id,
            'album_id': id
        }, auth.access_token);
    }

    //function loadPhotoChain(photos, albumName) {
    //    let chain = Promise.resolve();
    //
    //    if (!photos.length) return chain;
    //
    //    photos.forEach(function(photo) {
    //        chain = chain
    //            .then(function() {
    //
    //                var url = photo.src_xxxbig || photo.src_xxbig || photo.src_xbig || photo.src_big || photo.src_small || photo.src;
    //                return new Promise(function(resolve, reject) {
    //                    request(url, {encoding: null}, function (error, response, body) {
    //                        if (error) reject(error);
    //                        resolve(body);
    //                    });
    //                });
    //            })
    //            .then(function(data) {
    //                var fileName = photo.src.match(/[\w-]+\.\w+$/)[0];
    //                if (albumName) {
    //                    fileName = albumName + '/'+fileName;
    //                }
    //                zip.append(data, {
    //                    name: fileName,
    //                    date: photo.date,
    //                    store: true
    //                });
    //            })
    //    });
    //
    //    return chain;
    //}

    function loadPhoto(photos, albumName) {
        var promises = [];

        if (!photos.length) return Promise.resolve();

        photos.forEach(function(photo) {
            var photoPromise = new Promise(function(resolve, reject) {
                var url = photo.src_xxxbig || photo.src_xxbig || photo.src_xbig || photo.src_big || photo.src_small || photo.src;

                if (!url) resolve();

                request(url, {encoding: null}, function (error, response, body) {
                    if (error) reject(error);
                    resolve(body);
                });
            });

            photoPromise.then(function(data) {
                    var fileName = photo.src.match(/[\w-]+\.\w+$/)[0];

                    if (albumName) {
                        fileName = albumName + '/'+fileName;
                    }
                
                    zip.append(data, {
                        name: fileName,
                        date: new Date(photo.created * 1000),
                        store: true
                    });
                });

            promises.push(photoPromise);
        });

        return Promise.all(promises);
    }

    function addPhoto(album, finish) {
        if (photos.length) {
            var item = photos[0];
            request(item.src, {encoding: null}, function (error, response, body) {
                if (error) return;


                photos.splice(0, 1);

                addPhoto(finish);
            })
        } else {
            finish();
        }
    }


});

module.exports = router;
