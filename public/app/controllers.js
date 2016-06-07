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
		// keep a list and an input field for new chords
		$scope.chordList = [];
		$scope.newChordInput = "";
		
		// add chords
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

			resetTabs();
		}

		// helper function for checking duplicates
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

		// redraw the tabs when tabs are added or deleted
		function resetTabs(){
			// find the tab lists
			var tabTop = document.getElementById('chord-tab-top');

			// clear the tab lists
			tabTop.innerHTML = '';

			// repopulate
			$scope.chordList.forEach(function(chord, index){
				// create a div element and assign it a new id;
				var chordDiv = document.createElement('div');
				chordDiv.id = 'chord' + index;
				chordDiv.className = 'chord-tab';

				// attach the element to the tab lists
				tabTop.appendChild(chordDiv);

				// draw the tab in the div;
				Raphael.chord('chord' + index, chord.tab, chord.root + chord.mod);
			})
		};

		// delete tabs
		$scope.deleteChord = function(chordID){
			$scope.chordList.splice(chordID, 1);
			resetTabs();
		};

		// create new draggable chord label
		$scope.addLabel = function(chord){
			// create the element and add the text;
			var newLabel = document.createElement('div');
			newLabel.className = 'draggable ' + chord.root + chord.mod + ' chord-label';
			newLabel.innerHTML = chord.root + chord.mod;

			// prepend new element to lyrics
			lyrics = document.getElementById('lyrics');
			lyrics.insertBefore(newLabel, lyrics.childNodes[0]);
		}

/***** copied interactjs code *****/
		// target elements with the "draggable" class
		interact('.draggable')
		  .draggable({
		    // enable inertial throwing
		    inertia: true,
		    // keep the element within the area of it's parent
		    restrict: {
		      restriction: "parent",
		      endOnly: true,
		      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
		    },
		    // enable autoScroll
		    autoScroll: true,

		    // call this function on every dragmove event
		    onmove: dragMoveListener,
		    // call this function on every dragend event
		    onend: function (event) {
		      var textEl = event.target.querySelector('p');

		      textEl && (textEl.textContent =
		        'moved a distance of '
		        + (Math.sqrt(event.dx * event.dx +
		                     event.dy * event.dy)|0) + 'px');
		    }
		  }
		);

	  function dragMoveListener (event) {
	    var target = event.target,
	        // keep the dragged position in the data-x/data-y attributes
	        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
	        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

	    // translate the element
	    target.style.webkitTransform =
	    target.style.transform =
	      'translate(' + x + 'px, ' + y + 'px)';

	    // update the posiion attributes
	    target.setAttribute('data-x', x);
	    target.setAttribute('data-y', y);
	  }

	  // enable draggables to be dropped into this
		interact('.delete-section').dropzone({
		  // only accept elements matching this CSS selector
		  accept: '.draggable',
		  // Require a 75% element overlap for a drop to be possible
		  overlap: 0.75,

		  // listen for drop related events:

		  ondropactivate: function (event) {
		    // add active dropzone feedback
		    event.target.classList.add('drop-active');
		  },
		  ondragenter: function (event) {
		    var draggableElement = event.relatedTarget,
		        dropzoneElement = event.target;

		    // feedback the possibility of a drop
		    dropzoneElement.classList.add('drop-target');
		    draggableElement.classList.add('can-drop');
		    draggableElement.textContent = 'Dragged in';

		    console.log('attempting to release restriction');
		    console.log(event.draggable.options.drag.restrict.restriction);
		    event.draggable.options.drag.restrict.restriction = '';
		    console.log(event.draggable.options.drag.restrict.restriction);
		  },
		  ondragleave: function (event) {
		    // remove the drop feedback style
		    event.target.classList.remove('drop-target');
		    event.relatedTarget.classList.remove('can-drop');
		    event.relatedTarget.textContent = 'Dragged out';

		    console.log('attempting to enforce restriction');
		    console.log(event.draggable.options.drag.restrict.restriction);
		    event.draggable.options.drag.restrict.restriction = 'parent';
		    console.log(event.draggable.options.drag.restrict.restriction);
		  },
		  ondrop: function (event) {
		    event.relatedTarget.textContent = 'Dropped';
		    event.relatedTarget.style.display = 'none';
		  },
		  ondropdeactivate: function (event) {
		    // remove active dropzone feedback
		    event.target.classList.remove('drop-active');
		    event.target.classList.remove('drop-target');
		  }
		});

/***** end copied interactjs code *****/
	}
]);