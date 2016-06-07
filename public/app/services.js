var services = angular.module('ChordServices', []);

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