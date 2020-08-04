import * as functions from 'firebase-functions';

const request = require('request'); // "Request" library
const cors = require('cors');
const corsHandler = cors({origin : true});

// Client Data
const client_id : string = 'https://www.youtube.com/watch?v=SzfX9DUzwGg'; 
const client_secret : string = 'https://www.youtube.com/watch?v=SzfX9DUzwGg';

const data : string = client_id + ':' + client_secret;
const buffer : string = Buffer.from(data).toString('base64');

// Auth Data
const authOptions : Object = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (buffer)
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};


export const getSpotifyAccessToken = functions.https.onRequest(async (req, res) =>{
  try {

    // @ts-ignore
    // tslint:disable-next-line:no-empty
    corsHandler(req, res, async () =>  {
      request.post(authOptions, async function(error : any, response : any, body: any) {
        if (error){
            res.status(500).send(error)
        }
        if (!error && response.statusCode === 200) {
          // use the access token to access the Spotify Web API
          const token = body.access_token;
          
          res.status(200).send(token)

          return token;
        }
      })
    });
  }
  catch (err){
    res.status(500).send(err);
  }
});