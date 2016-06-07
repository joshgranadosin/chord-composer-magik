var ctrls = angular.module('ChordCtrls', []);

ctrls.controller('LoginCtrl', ['$scope', '$state', '$window',
	function($scope, $state, $window){
		$scope.connected = "Connected to LoginCtrl";

		$scope.linkTo = function(){
			$state.go('composer');
		}
	}
]);

ctrls.controller('ComposerCtrl', ['$scope', '$state', '$window',
	function($scope, $state, $window){
		$scope.connected = "Connected to ComposerCtrl";

		// add chords to chord list
		$scope.chordList = [];
		$scope.newChordInput = "";
		
		$scope.addChord = function(){
			// Grab string
			var newChordStr = $scope.newChordInput;

			// Check if it's sharp or flat
			var accidental = (newChordStr[1] === '#' || newChordStr[1] === 'b');

			// Check if there's a modifier
			var modified = (accidental && newChordStr[2] || !accidental && newChordStr[1]);

			// Grab the root note, including # or b modifier
			var chordRoot;
			if(accidental){chordRoot = newChordStr.substring(0,2);}
			else{chordRoot = newChordStr[0];}

			// Grab the modifier if it exists;
			var chordMod;
			if(modified && accidental){chordMod = newChordStr.substring(2);}
			else if(modified && !accidental){chordMod = newChordStr.substring(1);}
			else{chordMod = 'maj'}

			// Check if chordMod is 'm'
			if(chordMod === 'm'){chordMod = 'min'}

			// Find the Chord
			var chordTab = Raphael.chord.find(chordRoot, chordMod, 1);
			if(chordTab === undefined){
				console.log('Sorry, not a valid chord. Check your spelling.')
				return;
			}

			// See if it's already in the list
			if(isDuplicate(chordTab)){
				console.log('This chord is already in the list.')
				return;
			}

			// Add the chord as an obj to the list
			$scope.chordList.push({root: chordRoot, mod: chordMod, tab: chordTab});
			console.log($scope.chordList);
		}

		function isDuplicate(tab){
			// check to see if the list is empty
			if($scope.chordList.length === 0){
				return false;
			}
			// check if the tabs are the same
			for(let i = 0; i < $scope.chordList.length; i++){
				if($scope.chordList[i].tab === tab){
					return true;
				}
			}
			return false;
		};
	}
]);