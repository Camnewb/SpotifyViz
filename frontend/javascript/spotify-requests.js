/**
 * This is an example of a basic node.js script that performs
 * the Client Credentials oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#client_credentials_flow
 */

var request = require('request'); // "Request" library

var client_id = '2711dc5087234919859e0262a27b2065'; // Your client id
var client_secret = '6a1dd27880ef42329e7e0ff9e137d763'; // Your secret

// your application requests authorization
var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

function getAlbumCoverURL(songID)
{
  let albumCoverURL = ''
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
  
      // use the access token to access the Spotify Web API
      var token = body.access_token;
      var options = {
        url: 'https://api.spotify.com/v1/tracks/' + songID,
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };
      request.get(options, function(error, response, body) {
        albumCoverURL = body.album.images[0].url
        console.log("Album Cover URL: " + albumCoverURL);
        console.log(token);
        
      });
    }
  });

  return albumCoverURL
}
getAlbumCoverURL('3a09UyeSiFl7NF31K5vXKF')