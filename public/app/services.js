var services = angular.module('ChordServices', ['ngResource']);

services.factory('Auth', ['$window', function($window) {
  return {
    saveToken: function(token) {
      $window.localStorage['chord-composer-token'] = token;
    },
    getToken: function() {
      return $window.localStorage['chord-composer-token'];
    },
    removeToken: function() {
      $window.localStorage.removeItem('chord-composer-token');
    },
    isLoggedIn: function() {
      var token = this.getToken();
      return token ? true : false;
    },
    currentUser: function() {
      if (this.isLoggedIn()) {
        var token = this.getToken();
        try {
          var payload = JSON.parse($window.atob(token.split('.')[1]));
          return payload;
        } catch(err) {
          return false;
        }
      }
    }
  }
}]);

services.factory('AuthInterceptor', ['Auth', function(Auth) {
  return {
    request: function(config) {
      var token = Auth.getToken();
      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }
      return config;
    }
  }
}]);

services.factory('SongSheetAPI', ['$resource', function($resource){
	return $resource("/songsheet/:id", { id: "@_id" },
		{
      'create':  { method: 'POST' },
      'index':   { method: 'GET', isArray: true },
      'show':    { method: 'GET', isArray: false },
      'update':  { method: 'PUT' },
      'destroy': { method: 'DELETE' }
    }
  );
}]);

// services.factory('UserAPI', ['$http', function($http){
// 	return $resource("/user/",
// 		{
// 			'login':  { method: 'GET', isArray: false},
// 			'signup': { method: 'POST', isArray: false},
// 			'logout': { method: 'DELETE'}
// 		}
// }])