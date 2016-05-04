(function(window) {
    'use strict';
    var app = angular.module('main', ['ngCookies']);

    app.controller('MainController', function ($scope, $http, $window, $interval, $cookies, $q) {
        $scope.user = null;
        $scope.albums = null;
        $scope.isAuth = {
            vkontakte: false,
            google: false
        };

        $scope.authLink = {
            vkontakte: '',
            google: ''
        };

        $scope.authorization = authorization;
        $scope.getUser = getUser;
        $scope.getAlbums = getAlbums;
        $scope.logout = logout;
        $scope.select = select;
        $scope.download = download;
        $scope.selectedCount = selectedCount;

        $scope.authTimer = {
            vkontakte: undefined,
            google: undefined
        };

        $scope.totalPhotos = 0;
        $scope.totalSelectedPhotos = 0;
        $scope.totalSelectedAlbums = 0;


        var init = function() {
            var promises = [getUser(), getAlbums()];

            $q.all(promises)
                .then(function() {
                    $scope.isAuth.vkontakte = true;
                }, function(reason) {
                    console.log('Authorization failed:', reason);
                });
        };
        init();

        function getUser() {
            return $http.get('/user').then(function(res) {
                $scope.user = res.data;
                return res;
            })
        }

        function getAlbums() {
            return $http.get('/albums').then(function(res) {
                $scope.albums = res.data.map(function(elm) {

                    $scope.totalPhotos += elm.size;
                    elm.selected = true;
                    return elm;
                });
                selectedCount();
                return res;
            })
        }

        function logout(name) {

            $scope.isAuth[name] = false;
            $cookies.remove(name)
        }

        function select(album) {
            for (var i = 0; i < $scope.albums.length; i++) {
                if ($scope.albums[i] == album) {
                    $scope.albums[i].selected = !$scope.albums[i].selected;
                }
            }

            selectedCount();
        }

        function authorization(name) {

            $interval.cancel($scope.authTimer[name]);

            $http.get('/auth/'+name).then(function(res) {

                $window.open(res.data, '', 'width=500,height=400');
                $scope.authLink[name] = res.data;
                $scope.authTimer[name] = $interval(function() {
                    if ($cookies.get(name)) {
                        console.log('Success authorization');
                        $interval.cancel($scope.authTimer[name]);
                        $scope.isAuth[name] = true;
                        init();
                    }
                }, 1000)
            });

        }

        function download() {
            var selectedAlbums = $scope.albums
            .filter(function(elm) {
                return !!elm.selected;
            })
            .map(function(elm) {
                return elm.aid;
            })
            .join(',');

            window.open('/download?albums='+selectedAlbums, '_self');

        }

        function selectedCount() {

            $scope.totalPhotos = 0;
            $scope.totalSelectedPhotos = 0;
            $scope.totalSelectedAlbums = 0;

            for(var i = 0, album; i < $scope.albums.length; i++) {
                album = $scope.albums[i];
                $scope.totalPhotos += album.size;

                if (album.selected) {
                    $scope.totalSelectedPhotos += album.size;
                    $scope.totalSelectedAlbums += 1;
                }
            }
        }

    });
})(window);