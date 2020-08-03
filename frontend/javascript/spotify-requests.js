// Authentication token (v) Should create a function that generates it live instead. Oh well.
var auth_token = "BQDFvum3JsAQXoEIFehPuKyRT3ZLVD7i9Xmvn9gxkt-z_DWuphJqB3QV0Ji6vNDVXPTt5PAZJ8lSHvWuHHY"

// Uses spotify api to grab the album cover of a song.
function getAlbumCoverURL(songID) {
 // Used https://stackoverflow.com/questions/61817528/vscode-no-debug-adapter-can-not-send-variables
  let albumCoverURL = ''
  let xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.spotify.com/v1/tracks/' + songID, true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + auth_token);
  xhr.send();

    console.log("get")
  xhr.onreadystatechange = function (e) {
    if (xhr.readyState == 4 && xhr.status == 200) {
        var response = JSON.parse(xhr.responseText);
        albumCoverURL = response.album.images[0].url;
        console.log(albumCoverURL)
      }
  }
return albumCoverURL;
}

