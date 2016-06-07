var app = angular.module('ChordApp', ['ChordCtrls', 'ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
	$urlRouterProvider.otherwise('/');

	$stateProvider
	.state('login', {
		url: '/',
		templateUrl: 'views/login.html',
		controller: 'LoginCtrl'
	})
	.state('signup', {
		url: 'signup',
		templateUrl: 'views/signup.html',
		controller: 'SignupCtrl'
	})
	.state('composer', {
		url: '/composer',
		templateUrl: 'views/composer.html',
		controller: 'ComposerCtrl'
	})
}]);