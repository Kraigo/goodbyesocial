var request = require('request');
var google = require('googleapis');

var OAuth2 = google.auth.OAuth2;

var hostname = "http://localhost:3000";

var base = {
    clientId: process.env.GOOGLE_CLIENT,
    secretId: process.env.GOOGLE_SECRET,
    redirect: '/auth/google'
};

var oauth2Client = new OAuth2(base.clientId, base.secretId, hostname + base.redirect);

var API = function() {};

API.prototype = {

    codeLink: function() {

        return oauth2Client.generateAuthUrl({
            access_type: 'online',
            scope: [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/userinfo.profile'
            ]
        });
    },

    auth: function(code) {
        return new Promise(function(resolve, reject) {
            oauth2Client.getToken(code, function (err, tokens) {
                if (!err) {
                    resolve(tokens);
                }
                else {
                    reject(err);
                }
            });
        });
    },

    drive: function(tokens) {
        var oc = new OAuth2(base.clientId, base.secretId, hostname + base.redirect);
        oc.setCredentials(tokens);

        return google.drive({ version: 'v2', auth: oc });
    },
    
    plus: function (tokens) {
        var oc = new OAuth2(base.clientId, base.secretId, hostname + base.redirect);
        oc.setCredentials(tokens);
        
        return google.plus({ version: 'v1', auth: oc });
    }


};

module.exports = new API();
