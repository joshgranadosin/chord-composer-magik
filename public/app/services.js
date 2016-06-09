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
          console.log('payload', payload);
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
        console.log('AuthInterceptor sees a token')
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

services.service('CurrentSongSheet', ['$window', function($window) {
  var id = null;
  var cache = null;

  return {
    get: function () {
      return id;
    },
    set: function(value) {
      id = value;
    },
    clear: function(){
      id = null;
    },
    cache: function(value) {
      console.log("Cached");
      cache = value;
      console.log(cache);
    },
    recoverCache: function(){
      var temp = cache;
      cache = null;
      return temp;
    },
    hasCache: function(){
      if(cache === null){
        return false;
      }
      return true;
    }
  };
}]);