var app = angular.module('ChordApp', ['ChordCtrls', 'ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider',
	function($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider){
	$urlRouterProvider.otherwise('/');

	$stateProvider
	.state('login', {
		url: '/',
		templateUrl: 'views/login.html',
		controller: 'LoginCtrl'
	})
	.state('signup', {
		url: '/signup',
		templateUrl: 'views/signup.html',
		controller: 'SignUpCtrl'
	})
	.state('composer', {
		url: '/composer',
		templateUrl: 'views/composer.html',
		controller: 'ComposerCtrl'
	})
	.state('songlist', {
		url: '/songlist',
		templateUrl: 'views/songlist.html',
		controller: 'SongListCtrl'
	})

	$httpProvider.interceptors.push('AuthInterceptor')
 	$locationProvider.html5Mode(true);
}]);