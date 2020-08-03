// Authentication token (v) Should create a function that generates it live instead. Oh well.
var auth_token = "BQAYaVx2z15K51ch7zUPn9aRP9pQZxkRPVVl7djnUAIHL15gZ0KTy6nNJkAUGK0ivzZ4UYFI7NwCqTz84hY"
// Uses spotify api to grab the album cover of a song.
var albumCoverURL

async function getAlbumCoverURL(songID) {
 // Used https://stackoverflow.com/questions/61817528/vscode-no-debug-adapter-can-not-send-variables
  
  var xhr = new XMLHttpRequest();
  return new Promise(function(resolve, reject) {
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          let songData = JSON.parse(xhr.responseText);
          let url = songData.album.images[0].url;
          //console.log(url);
          resolve(url);
        }
        else reject("Error, status code =" + xhr.status);
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
    console.log("Success! - " + user)
    getSongByID(songID).album_cover = user;
    console.log(getSongByID(songID).album_cover)
  } catch (err) {
    console.error("Error. - " + err)
  }
}



