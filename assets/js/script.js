var APIKey = '400264-project1-2ZU40HSL';
var unencodedBandName = '';
var playlistName = '';
var songArr = [];
var songIndex = 0;
var savedPlaylist =[];

function encodeBandName(band){
	return band.replace(/ /g,"+");
};

function parseBandNames(response){
	var bandArr = [];
	bandArr.push(unencodedBandName);
	response.Similar.Results.forEach(band => {
		bandArr.push(band.Name);
	}); 
	return bandArr;
};

function generateRandomNumber(response){
	return Math.floor(Math.random() * response.data.length);

};

function generateSimilarBandList(bandName){
	var queryURL = `https://tastedive.com/api/similar?q=${bandName}&k=${APIKey}`
	$.ajax({
		url: queryURL, 
		type: "GET",
		dataType: 'jsonp',
		success: function(response){
			var bandNameArr = parseBandNames(response);
			console.log(bandNameArr);
			getArtistTrackList(bandNameArr);
		}
	}); 
};

function getArtistTrackList(bandNameArr){
	bandNameArr.forEach(bandname =>{
		var queryURL = `https://api.deezer.com/search?q=${bandname}&output=jsonp`; 
		$.ajax({
			url: queryURL,
			type: "GET", 
			dataType: 'jsonp', 
			success: function(response){
				var albumNumber = generateRandomNumber(response)
				var artistObj = {
					artistId: response.data[albumNumber].artist.id,
					albumId: response.data[albumNumber].album.id, 
					name: response.data[albumNumber].artist.name, 
					albumPicture: response.data[albumNumber].album.cover_small,
					tracklist: response.data[albumNumber].album.tracklist, 

				}
				getTrack(artistObj);
			},
		});
	});
};

function getTrack(artistObj){
	var queryURL = `${artistObj.tracklist}&output=jsonp`;
	$.ajax({
		url: queryURL, 
		type: "GET",
		dataType: 'jsonp', 
		success: function(response){
			var trackNum = generateRandomNumber(response);
			artistObj.track = response.data[trackNum].title;
			artistObj.preview = response.data[trackNum].preview; 

			console.log(artistObj);

			addToMixTape(artistObj, false);
		}
	});
};

function addToMixTape(artistObj, dontAppend){
	var container = $("#mixTapeList"); 

	var row = $("<div>").attr({"class": "row"});
	var imgCol = $("<div>").attr({"class": "four"});
	var textCol = $("<div>").attr({"class": "eight"});

	var albumImg = $("<img>").attr({"src":artistObj.albumPicture})
	var albumArtist = $("<p>").html(`Artist: ${artistObj.name}`)
	var albumSong = $("<p>").html(`Album: ${artistObj.track}`)
	songArr.push(artistObj.preview);


	imgCol.append(albumImg); 
	textCol.append(albumArtist,albumSong);

	row.append(imgCol, textCol);
	container.append(row);

	if(dontAppend === true){
		console.log("in if statement")
		return;
	}else{
		addTosavedPlaylist(artistObj);
	}
	
};

function addTosavedPlaylist(artistObj){
	if (localStorage.getItem(`${playlistName}`) === null){
		savedPlaylist.push(artistObj);
		localStorage.setItem(playlistName, JSON.stringify(savedPlaylist));
	}
	else{
		savedPlaylist = JSON.parse(localStorage.getItem(playlistName))
		savedPlaylist.push(artistObj);
		localStorage.setItem(playlistName, JSON.stringify(savedPlaylist));
    }

}
function getSavedPlaylist(playlistName){
    savedPlaylist = JSON.parse(localStorage.getItem(playlistName));
    savedPlaylist.forEach(artist => {
    addToMixTape(artist, true);
    })
}
function displaySavedPlaylists() {
    var prevContainer = $('#prevContainer');
    var previousPlaylists = $('<input>').attr({'type':'button', 'value':playlistName, 'class': 'previousList'});
    prevContainer.prepend(previousPlaylists); 

}

function playSong(){
	var currentSong = $("#song");
	console.log(songArr);
	currentSong.attr({"src":songArr[songIndex]});
	currentSong[0].play();		
}

function stopSong(){
	var currentSong = $("#song");
	console.log(currentSong.currentTime);
	currentSong[0].pause();
}

function nextSong(){
	if(songIndex === songArr.length-1){
		songIndex = 0;
	}else{
		songIndex++; 
	}
	playSong(); 
}

function prevSong(){
	if(songIndex === 0){
		songIndex = songArr.length-1;
		console.log(songIndex)
	}else{
		songIndex--; 
	} 
	playSong();
}

function clearGlobals(){
	$("#mixTapeList").empty();
    songArr = [];
    savedPlaylist = [];
    songIndex = 0
}

$("#searchBtn").on("click", function(event){
	event.preventDefault();
	clearGlobals();

	unencodedBandName = $("#searchParameter").val();
	playlistName = $("#userMixTapeName").val(); 
	var bandName = encodeBandName(unencodedBandName);

    generateSimilarBandList(bandName);
    displaySavedPlaylists();

    $("#searchParameter").val("");
    $("#userMixTapeName").val("");
    
    
});

$("#prev").on("click", prevSong);
$("#play").on("click", playSong);
$("#stop").on("click", stopSong);
$("#next").on("click", nextSong);

$("#song").on("ended", function(){
	if(songIndex < songArr.length){
		setTimeout(function(){
			songIndex++;
			playSong();
		},1000);	
	}else{
		songIndex = 0;
		playSong();
	}	
});

$(document).on("click", ".previousList", function(){
    var playlistName = $(this).val();
  
    clearGlobals()
    getSavedPlaylist(playlistName);
});