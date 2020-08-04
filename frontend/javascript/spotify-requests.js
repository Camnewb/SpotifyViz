// Authentication token (v) Should create a function that generates it live instead. Oh well.
var auth_token = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
// Uses spotify api to grab the album cover of a song.

window.onload = function() {
  getSpotifyAuthToken();
}
function getSpotifyAuthToken() {
  var url = 'https://us-central1-spotifyviz-68e56.cloudfunctions.net/getSpotifyAccessToken'
  console.log("Sending request for spotify auth token...");
  //Create the request object

  var xhr = new XMLHttpRequest();
  
  xhr.onerror = function(e) {
    console.log("Error.");
  }

  xhr.onreadystatechange = function (e) {
    console.log("Ready State changed: " + this.readyState +  " with Status: " + this.status);
    //On state change, check if the request is ready
    if (this.readyState == 4) {
      if (this.status == 200) {
        //If it's ready, parse the JSON and set auth_token
        console.log("Data recieved.");
        auth_token = xhr.responseText;
        console.log(auth_token);
    }
  }
};
  
  xhr.open("GET", url, true);
  xhr.send();
  console.log("Request sent. Waiting for response...");
}

async function getAlbumCoverURL(songID) {
 // Used https://stackoverflow.com/questions/61817528/vscode-no-debug-adapter-can-not-send-variables
 
  var xhr = new XMLHttpRequest();
  return new Promise(function(resolve, reject) {
    xhr.onreadystatechange = function() {
      if (xhr.status == 401) {
        console.log("TOKEN INVALID.");
      }

      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          let songData = JSON.parse(xhr.responseText);
          let url = songData.album.images[1].url;
          resolve(url);
        }
        else reject("Error, status code = " + xhr.status);
        }

  }

  xhr.open('GET', 'https://api.spotify.com/v1/tracks/' + songID, true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + auth_token);
  xhr.send();
  });
}

async function albumURL(songID) {
  try {
    let user = await getAlbumCoverURL(songID);
    console.log("Success! - " + songID);
    getSongByID(songID).album_cover = user;
    //console.log(getSongByID(songID).album_cover)
  } catch (err) {
    console.log("albumURL ERROR: " + songID);
  }
}

