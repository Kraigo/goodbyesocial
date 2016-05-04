var request = require('request');

var base = {
    clientId: process.env.VKONTAKTE_CLIENT,
    secretId: process.env.VKONTAKTE_SECRET,
    redirect: '/auth/vkontakte',
    url: 'https://api.vk.com/method/',
    version: '5.50',
    scope: 'photos'
};

var VkApi = function() {};

VkApi.prototype = {

    request: function(link) {
        return new Promise(function(resolve, reject){
            request(link, function (error, response, body) {
                if (!error) {
                    resolve(body);
                } else {
                    reject(error, response, body);
                }
            })
        });
    },

    codeLink: function(hostname) {
        return 'https://oauth.vk.com/authorize'
            + '?client_id=' + base.clientId
            + '&redirect_uri=' + hostname + base.redirect
            + '&display=popup'
            + '&scope=' + base.scope;
    },

    auth: function(code, hostname) {
        var accessTokenLink = 'https://oauth.vk.com/access_token'
            + '?client_id=' + base.clientId
            + '&client_secret=' + base.secretId
            + '&redirect_uri=' + hostname + base.redirect
            + '&code=' + code;

        return this.request(accessTokenLink);
    },

    get: function(method, params, token) {

        var link = base.url + method;

        if (params) {
            Object.keys(params).forEach(function(key, i, self) {
                link += (i === 0) ? '?' : '&';
                link += key + '=' + params[key];
            });
        }

        link += '&access_token=' + token;

        return this.request(link).then(function(result) {
            result = JSON.parse(result);
            return result.response || result.error;
        }, function(error) {
            console.log('Error '+method+':', error)
        });
    }
};

module.exports = new VkApi();
