var ctrls = angular.module('ChordCtrls', ['ChordServices']);

ctrls.controller('LoginCtrl', ['$scope', '$state', '$window', '$http', 'Auth', 'CurrentSongSheet',
	function($scope, $state, $window, $http, Auth, CurrentSongSheet){
		// variables on the page
		$scope.email = '';
		$scope.password = '';

		// clear the current songsheet
		CurrentSongSheet.clear();

		$scope.login = function(){
			var payload = {email: $scope.email, password: $scope.password};
			console.log(payload);

			$http.post('/login', payload).then(
				function success(res){
					Auth.saveToken(res.data.token);
					console.log(res);
					$state.go('songlist');
				},
				function error(res){
					console.log(res);
				}
			);
		}

		$scope.linkTo = function(str){
			$state.go(str);
		}
	}
]);

ctrls.controller('SignUpCtrl', ['$scope', '$state', '$window', '$http', 'Auth',
	function($scope, $state, $window, $http, Auth){
		$scope.email = '';
		$scope.password = '';

		// sign up
		$scope.signup = function(){
			var payload = {email: $scope.email, password: $scope.password};

			console.log(payload);

			$http.post('/signup', payload).then(
				function success(res){
					Auth.saveToken(res.data.token);
					console.log(res);
					$state.go('composer');
				},
				function error(res){
					console.log(res);
				}
			);
		}

		// move between places
		$scope.linkTo = function(str){
			$state.go(str);
		}
	}
]);

ctrls.controller('SongListCtrl', [
	'$scope', '$state', '$window', '$http', 'Auth', 'SongSheetAPI', 'CurrentSongSheet',
	function($scope, $state, $window, $http, Auth, SongSheetAPI, CurrentSongSheet){
		$scope.userEmail = Auth.currentUser().email;
		$scope.songSheets = [];
		getSongList();

		// grab the song list
		function getSongList(){
			SongSheetAPI.index(
				function success(data){
					console.log('success', data);
					$scope.songSheets = data;
				},
				function error(data){
					console.log('error', data);
				}
			);
		}

		// log out by deleting the token
		$scope.logout = function(){
			Auth.removeToken();
			console.log('Token removed');
			$state.go('login');
		}

		// pass along the song ID before going to the composer
		$scope.open = function(songId){
			console.log("open",songId);

			CurrentSongSheet.set(songId);
			$state.go('composer');
		}

		// delete
		$scope.delete = function(songId){
			console.log("delete",songId);
			SongSheetAPI.destroy({id:songId},
				function success(res){
					console.log(res);
					getSongList();
				},
				function error(res){
					console.log(res);
				}
			)
		}

		// move between places
		$scope.linkTo = function(str){
			$state.go(str);
		}
	}
]);

ctrls.controller('ComposerCtrl', [
	'$scope', '$state', '$window', 'Auth', 'SongSheetAPI', 'CurrentSongSheet',
	function($scope, $state, $window, Auth, SongSheetAPI, CurrentSongSheet){
		// use default unless they're logged in.
		$scope.userEmail = "you're logged in as Guest";
		if(Auth.currentUser()){
			$scope.userEmail = Auth.currentUser().email;
		}

		// use default if it's a new song
		$scope.chordList = [];
		$scope.newChordInput = "";
		$scope.songArtist = " by Song Artist";
		$scope.songTitle = "Song Title";
		$scope.tabDisplay = 'top';
		var songId = undefined;
		var tabDisplaySection = document.getElementById('chord-tab-' + $scope.tabDisplay);

		// grab the old info if it's a saved song
		console.log(CurrentSongSheet.get());
		if(CurrentSongSheet.get()){
			SongSheetAPI.show({id:CurrentSongSheet.get()},
				function success(res){
					$scope.chordList = res.chords;
					$scope.songArtist = res.artist;
					$scope.songTitle = res.title;
					$scope.tabDisplay = res.tabs;
					songId = res._id;
					document.getElementById('lyrics').innerHTML = res.data;
					resetTabs();
				},
				function error(res){
					console.log('error', res);
				}
			)
		}
		
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
			// don't bother drawing if none is selected
			if($scope.tabDisplay === 'none'){
				return;
			}

			// clear the tab lists
			tabDisplaySection.innerHTML = '';

			// find the tab lists
			tabDisplaySection = document.getElementById('chord-tab-' + $scope.tabDisplay);
			console.log(tabDisplaySection);

			// repopulate
			$scope.chordList.forEach(function(chord, index){
				// create a div element and assign it a new id;
				var chordDiv = document.createElement('div');
				chordDiv.id = 'chord' + index;
				chordDiv.className = 'chord-tab';

				// attach the element to the tab lists
				tabDisplaySection.appendChild(chordDiv);

				// draw the tab in the div;
				console.log(chord.root + chord.mod);

				// attempt to ensure redraw
				setTimeout(function(){
					Raphael.chord('chord' + index, chord.tab, chord.root + chord.mod);
				},10);
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

		$scope.save = function(){
			// Don't save if they're not logged in.
			if(!Auth.currentUser()){
				console.log("Must be logged in to save.");
				return;
			}

			var payload = {
				title: $scope.songTitle,
				artist: $scope.songArtist,
				chords: $scope.chordList,
				data: document.getElementById('lyrics').innerHTML,
				tabs: $scope.tabDisplay
			}

			// make a new one
			console.log(CurrentSongSheet.get())
			if(!CurrentSongSheet.get()){
				SongSheetAPI.create(payload,
					function success(res){
						console.log(res);
						CurrentSongSheet.set(res.doc._id);
						console.log(CurrentSongSheet.get());
					},
					function error(res){
						console.log(res);
					}
				);
			}

			// or update one
			else{
				SongSheetAPI.update({id:CurrentSongSheet.get()}, payload,
					function success(res){
						console.log(res);
					},
					function error(res){
						console.log(res);
					}
				)
			}
		}

		// log out by removing the token
		$scope.logout = function(){
			Auth.removeToken();
			console.log('Token removed');
			$state.go('login');
		}

		$scope.delete = function(){
			console.log("delete",CurrentSongSheet.get());

			// if they're not logged in
			if(!CurrentSongSheet.get() && !Auth.currentUser()){
				return $state.go('login');
			}

			// if it's a new song
			if(!CurrentSongSheet.get()){
				return $state.go('songlist');
			}

			// delete
			SongSheetAPI.destroy({id:CurrentSongSheet.get()},
				function success(res){
					console.log(res);
					$state.go('songlist');
				},
				function error(res){
					console.log(res);
				}
			)
		}

		// send the print area to the printer
		$scope.print = function(){
			var page = document.getElementsByClassName('writing-area')[0].innerHTML;
			//CurrentSongSheet.cache = page;
			$state.go('print');
			setTimeout(function(){
				document.getElementsByClassName('printing-area')[0].innerHTML = page;
				window.print();
				setTimeout(function(){
					window.history.back();
				}, 10)
			},1000)		
		}

		// move between places
		$scope.clickName = function(){
			if(Auth.currentUser()){
				return $state.go('songlist');
			}
			return $state.go('signup');
		}

		$scope.changeTabDisplay = function(){
			console.log($scope.tabDisplay);
			resetTabs();
		}

/***** copied interactjs code *****/
		// target elements with the "draggable" class
		interact('.draggable')
		  .draggable({
		    // enable inertial throwing
		    inertia: false,
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
		    // onend: function (event) { // don't need it now, but want to keep it
		    // }

		    // color the dragging item different
		    onstart: function(event){
		    	console.log('dragging');
		    	event.target.classList.add('dragging');
		    },

		    onend: function(event){
		    	event.target.classList.remove('dragging');
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

		    // allow the element to be dropped outside of the lyrics
		    event.draggable.options.drag.restrict.restriction = '';
		    if(event.draggable.options.drag.restrict.restriction === ''){
			    console.log('Restriction released');
			  }
		  },
		  ondragleave: function (event) {
		    // remove the drop feedback style
		    event.target.classList.remove('drop-target');
		    event.relatedTarget.classList.remove('can-drop');

		    // allow the element to snap back to the lyrics
		    event.draggable.options.drag.restrict.restriction = 'parent';
		    if(event.draggable.options.drag.restrict.restriction === 'parent'){
			    console.log("Restriction 'parent' enforced");
			  }
		  },
		  ondrop: function (event) {
		    // delete the element from the dom
		    var deleteable = event.relatedTarget;
		    deleteable.parentElement.removeChild(deleteable);
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