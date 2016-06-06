var ctrls = angular.module('ChordCtrls', []);

ctrls.controller('LoginCtrl', ['$scope', '$state', '$window',
	function($scope, $state, $window){
		$scope.connected = "Connected to LoginCtrl";
	}
]);

ctrls.controller('ComposerCtrl', ['$scope', '$state', '$window',
	function($scope, $state, $window){
		$scope.connected = "Connected to ComposerCtrl";
	}
])