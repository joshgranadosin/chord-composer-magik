var ctrls = angular.module('ChordCtrls', ['ChordServices']);

ctrls.filter('chordFilter', function() {
  return function(input) {
    if(input === 'maj'){
    	return '';
    }
    if(input === 'min'){
    	return 'm';
    }
    return input;
  }
});

ctrls.controller('LoginCtrl', [
	'$scope', '$state', '$window', '$http', 'Auth', 'CurrentSongSheet',
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
					console.log("logging in", res, CurrentSongSheet.hasCache());
					if(CurrentSongSheet.hasCache()){
						$state.go('composer');
					}
					else{
						$state.go('songlist');
					}
				},
				function error(res){
					console.log(res);
					swal("Unable To Log In", res.data.message, "error");
				}
			);
		}

		$scope.new = function(){
			CurrentSongSheet.clear();
			$state.go('composer');
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

			// front-end validate password length because it's not working through mongoose
			if(payload.password.length < 8 || payload.password.length > 20){
				return swal("Unable To Create Account", "Password must be between 8 and 20 characters", "error");
			}

			console.log(payload);

			$http.post('/signup', payload).then(
				function success(res){
					Auth.saveToken(res.data.token);
					console.log(res);
					$state.go('composer');
				},
				function error(res){
					console.log(res);
					swal("Unable To Create Account", res.data.message, "error");
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
		// get out if you're not logged in
		if(!Auth.currentUser()){
			console.log("Not logged in");
			return $state.go('login');
		}

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
	'$scope', '$state', '$window', 'Auth', 'SongSheetAPI', 'CurrentSongSheet', 'ChordModulate',
	function($scope, $state, $window, Auth, SongSheetAPI, CurrentSongSheet, ChordModulate){
		// use default unless they're logged in.
		$scope.userEmail = "you're logged in as Guest";
		if(Auth.currentUser()){
			$scope.userEmail = Auth.currentUser().email;
		}

		// use default if it's a new song
		$scope.chordList = [];
		$scope.newChordInput = "";
		$scope.songArtist = "Song Artist";
		$scope.songTitle = "Song Title";
		$scope.tabDisplay = 'top';
		var songId = undefined;
		var tabDisplaySection = document.getElementById('chord-tab-' + $scope.tabDisplay);

		// grab the cache if it's there
		var cached = CurrentSongSheet.recoverCache();
		console.log(cached);
		if(cached){
			$scope.chordList = cached.chords;
			$scope.songArtist = cached.artist;
			$scope.songTitle = cached.title;
			$scope.tabDisplay = cached.tabs;
			document.getElementById('lyrics').innerHTML = cached.data;
			resetTabs();	
		}

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

			// Capitalize
			chordRoot = chordRoot.toUpperCase();
			console.log(chordRoot);

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
				swal('Chord Not Found', 'Sorry, please check your spelling.', 'info');
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
					if(chord.mod === 'maj'){
						Raphael.chord('chord' + index, chord.tab, chord.root);
					}
					else if(chord.mod === 'min'){
						Raphael.chord('chord' + index, chord.tab, chord.root + 'm');
					}
					else{
						Raphael.chord('chord' + index, chord.tab, chord.root + chord.mod);
					}
					$scope.newChordInput = '';
				},10);
			})
		};

		// delete chord labels when tabs are deleted
		function sweep(str){
			var lyrics = document.getElementById('lyrics');
			var broom = 0;

			while(broom < lyrics.childNodes.length){
				if(lyrics.childNodes[broom].nodeType === Node.ELEMENT_NODE
					&& lyrics.childNodes[broom].classList.contains(str)){
					lyrics.childNodes[broom].remove();
				}
				else{
					broom++;
				}
			}
		}

		$scope.changeKey = function(steps){
			console.log('changeKey ', steps);

			$scope.chordList.forEach(function(chord){
				chord.root = ChordModulate.shift(chord.root, steps);
				chord.tab = Raphael.chord.find(chord.root, chord.mod, 1);
			});

			resetTabs();

			var lyrics = document.getElementById('lyrics');
			console.log(lyrics);

			for(var i = 0; i < lyrics.childNodes.length; i++){
				if(lyrics.childNodes[i].nodeType === Node.ELEMENT_NODE){
					var originalNote = lyrics.childNodes[i].innerHTML;

					// Check if it's sharp or flat
					var accidental = (originalNote[1] === '#' || originalNote[1] === 'b');

					// Grab the root note, including # or b modifier
					var originalRoot;
					if(accidental){originalRoot = originalNote.substring(0,2);}
					else{originalRoot = originalNote[0];}

					var newNote = ChordModulate.shift(originalRoot, steps);

					var newLabelText = lyrics.childNodes[i].innerHTML.replace(originalRoot, newNote);
					var newClassList = lyrics.childNodes[i].className.replace(' ' + originalNote, ' ' + newNote);
					lyrics.childNodes[i].innerHTML = newLabelText;
					lyrics.childNodes[i].classList = newClassList;

					console.log(lyrics.childNodes[i].className);
				}
			}
		}

		// delete tabs
		$scope.deleteChord = function(chordID){
			var removed = $scope.chordList.splice(chordID, 1);
			console.log('removed', removed);
			sweep(removed[0].root + removed[0].mod);
			resetTabs();
		};

		// create new draggable chord label
		$scope.addLabel = function(chord){
			// create the element and add the text;
			var newLabel = document.createElement('div');
			newLabel.className = 'draggable ' + chord.root + chord.mod + ' chord-label';

			if(chord.mod === 'maj'){
				newLabel.innerHTML = chord.root;
			}
			else if(chord.mod === 'min'){
				newLabel.innerHTML = chord.root + 'm';
			}
			else{
				newLabel.innerHTML = chord.root + chord.mod;
			}

			// prepend new element to lyrics
			lyrics = document.getElementById('lyrics');
			lyrics.insertBefore(newLabel, lyrics.childNodes[0]);
		}

		$scope.save = function(){
			var payload = {
				title: $scope.songTitle,
				artist: $scope.songArtist,
				chords: $scope.chordList,
				data: document.getElementById('lyrics').innerHTML,
				tabs: $scope.tabDisplay
			}

			// Don't save if they're not logged in.
			if(!Auth.currentUser()){
				swal(
					{
						title: "Unable to save",
						text: "You must be logged in to save. Do you want to log in?",
						type: "warning",
						showCancelButton: true,
						confirmButtonColor: "#DD6B55",
						confirmButtonText: "Log In",
						cancelButtonText: "Cancel",
						closeOnConfirm: true,
						closeOnCancel: true
					}, function(isConfirm){
						if (isConfirm) {
							CurrentSongSheet.cache(payload);
							$state.go('login');
						}
					}
				);
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

			swal(
				{
					title: "Are you sure?",
					text: "You may lose changes if you haven't saved.",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "Log Out",
					cancelButtonText: "Cancel",
					closeOnConfirm: false,
					closeOnCancel: true
				}, function(isConfirm){
					if (isConfirm) {
						swal(
							{
								title:"Logged Out",
								type: "success"
							}, function(){
								Auth.removeToken();
								console.log('Token removed');
								$state.go('login');
							}
						);
					}
				}
			);
		}

		$scope.delete = function(){
			console.log("delete",CurrentSongSheet.get());

			// sweet warning
			swal(
				{
					title: "Are you sure?",
					text: "You can't recover this file after delete.",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#DD6B55",
					confirmButtonText: "Yes, delete it!",
					closeOnConfirm: false
				}, function(){swal(
					{
						title: "Deleted",
						type: "success",
						closeOnConfirm: true
					}, function(){
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
				);
			});
		}

		// send the print area to the printer
		$scope.print = function(){
			var page = document.getElementsByClassName('writing-area')[0].innerHTML;
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
		  	// enable snapping
		  	snap: {
		      targets: [
		        interact.createSnapGrid({ x: 1, y: 60 })
		      ],
		      offset: { x: 0, y: 60 },
		      range: Infinity,
		      relativePoints: [ { x: 0, y: 0 } ]
		    },
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