angular.module('app', ['ngRoute', 'wu.masonry', 'ngSanitize']);
angular.module('app').run(['$rootScope', function($rootScope) {
    $rootScope.root = {};
    $rootScope.root.worldmap = '首页';
}]);
angular.module('app').config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/pages/index.html'
        })
        .when('/settings', {
            templateUrl: '/pages/settings.html',
        })
        .otherwise({
            redirectTo: '/'
        })
}]);
angular.module('app').run(['$rootScope', 'ajax', function($rootScope, ajax) {
    var href = '';
    ajax.retrieveUserInfo().then(function(data) {
        $rootScope.useravatar = data.data.results.useravatar;
        $rootScope.userphone = data.data.results.userphone;
        $rootScope.usernickname = data.data.results.usernickname;
    }).catch(function(err) {
        $rootScope.useravatar = '获取错误';
        $rootScope.userphone = '获取错误';
        $rootScope.usernickname = '获取错误';
    });
}]);
angular.module('app').directive('mgHeader', ['$window', 'ajax', function($window, ajax) {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: '/components/header/header.html',
        link: function(scope, element, attr) {
            scope.logout = function() {
                ajax.logout().then(function(data) {
                    if (data.data.results === 'success') {
                        $window.location = '/';
                    }
                });
            }
        }
    }
}]);
angular.module('app').directive('mgMain', ['ajax', '$interval', '$sce', function(ajax, $interval, $sce) {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: '/components/main/main.html',
        link: function(scope, element, attr) {
            scope.showPosts = function() {
                ajax.showPosts().then(function(data) {
                    scope.postsList = data.data.results;
                    data.data.results.forEach(function(result, index) {
                        result.comments.forEach(function(comment, index) {
                            ajax.getCommenter(comment.commenter).then(function(data) {
                                comment._commenter = data.data.results;
                            });
                        });
                    });
                }).catch(function(err) {})
            }
            scope.showPosts();
            var tt = $interval(function() {
                scope.showPosts();
            }, 10000);
            scope.$on('$destroy', function() {
                $interval.cancel(tt);
            });
            scope.trans = function(c) {
                return $sce.trustAsHtml(c);
            }
            scope.mkComment = function(poststamp, commentWords) {
                if (!commentWords || /<\s*script|<\*style/.test(commentWords)) {
                    return;
                }
                ajax.mkComment(poststamp, commentWords).then(function(data) {
                    console.log(data);
                }).catch(function(err) {
                    console.log(err);
                })
            }
            
        }
    }
}]);
angular.module('app').directive('mgTweet', ['$rootScope', 'ajax', function($rootScope, ajax) {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: '/components/tweet/tweet.html',
        link: function(scope, element, attr) {
            scope.postTweet = function() {
                if (!scope.posttitle || /<\s*script>|<\/script>|<\s*style>|<\/style>/.test(scope.posttitle) || !scope.postcontent || /<\s*script>|<\/script>|<\s*style>|<\/style>/.test(scope.postcontent)) {
                    scope.posttitle = 'badrequest,请改改再发送' + scope.posttitle;
                    scope.postcontent = 'badrequest,请改改再发送' + scope.postcontent;
                    return;
                }
                ajax.createPost({
                    posttitle: scope.posttitle,
                    postcontent: scope.postcontent
                }).then(function(data) {

                }).catch(function(err) {

                });
                scope.posttitle = '';
                scope.postcontent = '';
            }
        }
    }
}]);
angular.module('app').factory('ajax', ['$http', function($http) {
    var _o = {};
    _o.retrieveUserInfo = function() {
        return $http({
            method: 'POST',
            url: '/retrieveUserInfo'
        });
    }
    _o.changeUserInfo = function(paramsObj) {
        return $http({
            method: 'POST',
            url: '/changeUserInfo',
            data: paramsObj
        });
    }
    _o.logout = function() {
        return $http({
            method: 'POST',
            url: '/logout'
        })
    }
    _o.createPost = function(paramsObj) {
        return $http({
            method: 'POST',
            url: '/createPost',
            data: paramsObj
        });
    }
    _o.showPosts = function() {
        return $http({
            method: 'POST',
            url: '/showPosts',
        });
    }
    _o.mkComment = function(poststamp, commentWords) {
        return $http({
            method: 'POST',
            url: '/mkComment',
            data: {
                poststamp: poststamp,
                commentcontent: commentWords
            }
        });
    }
    _o.getCommenter = function(userId) {
        return $http({
            method: 'POST',
            url: '/getCommenter',
            data: {
                userid: userId
            }
        })
    }
    return _o;
}]);
angular.module('app').controller('settingsController', ['$scope', '$rootScope', '$timeout', 'ajax', '$interval', function($scope, $rootScope, $timeout, ajax, $interval) {
    $scope.$on('$routeChangeSuccess', function(e) {
        $rootScope.root.worldmap = '我的账户';
        var href;
        var foo = $interval(function() {
            var ifrm = document.querySelector('#ifrm');
            if (!!ifrm) {
                var _href = ifrm.contentWindow.location.href;
                if (_href !== href) {
                    href = _href;
                    ajax.retrieveUserInfo().then(function(data) {
                        $rootScope.useravatar = data.data.results.useravatar;
                        $rootScope.userphone = data.data.results.userphone;
                        $rootScope.usernickname = data.data.results.usernickname;
                    }).catch(function(err) {
                        $rootScope.useravatar = '获取错误';
                        $rootScope.userphone = '获取错误';
                        $rootScope.usernickname = '获取错误';
                    });
                }
            }
        }, 1000);
        $scope.$on('$routeChangeStart', function() {
            $interval.cancel(foo);
        })
    });
    $scope.validateUsernickname = function() {
        if ($scope.usernickname === "") return;
        $scope.usernickname = $scope.usernickname.match(/[\w\u4E00-\u9FA5]/g).join("");
        $scope.pass = $scope.usernickname !== '' ? true : false;
    }
    $scope.submit = function() {
        ajax.changeUserInfo({
            usernickname: $scope.usernickname
        }).then(function(data) {
            if (data.data.results === 'success') {
                $scope.results = '修改成功';
                ajax.retrieveUserInfo().then(function(data) {
                    $rootScope.useravatar = data.data.results.useravatar;
                    $rootScope.userphone = data.data.results.userphone;
                    $rootScope.usernickname = data.data.results.usernickname;
                }).catch(function(err) {
                    $rootScope.useravatar = '获取错误';
                    $rootScope.userphone = '获取错误';
                    $rootScope.usernickname = '获取错误';
                });
                $timeout(function() {
                    $scope.results = undefined;
                }, 1000);
            } else {
                $scope.results = '修改失败';
                $timeout(function() {
                    $scope.results = undefined;
                }, 1000);
            }
        }).catch(function(err) {
            $scope.results = '修改失败';
            $timeout(function() {
                $scope.results = undefined;
            }, 1000);
        })
    }
}]);