import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore()

// TODO: Implement JSON making of nodes

export const getLocalGraph = functions.https.onRequest(async (request, response) => {
    try{
        // Pulling in query variables
        const songName : string = request.query.song as string;
        const queryLimit : number = parseInt(request.query.limit as string);

        if (songName === undefined){
            throw Error("Song name was not provided");
        }

        console.log(`Song name ${songName}, queryLimit: ${queryLimit}`);
    
        const query = db.collection("songs").where('name', '==', songName).limit(1);
        const docsWithSongName = await query.get();
        
        if (docsWithSongName.empty){
            console.log("the document was empty")
            throw Error("That song does not exist in our database");
        }
        const songDoc = docsWithSongName.docs[0];
        
        
        const songNameIDCombo : string = songDoc.get("name") + "|" + songDoc.get("id");
        console.log(`songDoc combo: ${songNameIDCombo}`);
        let traversal : string = "";
        const queue : Array<string> = [];
        const visited : Set<string> = new Set();
        let popped : number = 0;

        // Initialzing queue and set with connected from original song
        queue.push(songNameIDCombo);
        visited.add(songNameIDCombo);
        
        while ((popped <= queryLimit) && queue.length !== 0){
            const curSong : string = queue.shift() as string;
            popped += 1
            const [curSongName, curSongSpotifyID] : Array<string> = getSpotifyID(curSong);

            if (curSongSpotifyID === undefined){
                continue;
            }

            traversal += `name: ${curSongName}, spotID: ${curSongSpotifyID}\n`
            
            const doc = await getRelated(curSongSpotifyID);
            const docConnectedTo : Array<string> = doc.get("connected_to");
            docConnectedTo.forEach( (songCombo : string ) => {
                if (!visited.has(songCombo)){
                    visited.add(songCombo);
                    queue.push(songCombo);
                }
            });

        }
        
        response.send(traversal);
    }
    catch (err){
        response.status(500).send(err);
        
    }
});

async function getRelated(spotifyID : string) {
    console.log(`trying to find song by spotifyID: ${spotifyID}`)
    const query = db
            .collection("songs")
            .where('id', '==', spotifyID)
            .limit(1);
        
    const results = await query.get();
    if (results.empty){
        return Promise.reject("Could not find any songs by that ID")
    }
    
    return results.docs[0];
}

// Returns the [name, spotifyID]
function getSpotifyID(combo : string) : Array<string> {
    console.log(`about to split ${combo}`)
    const comboList : Array<string> = combo.split("|");
    const spotifyID : string = comboList.pop() as string;
    const name : string = comboList.join("");
    console.log(`split into ${spotifyID} and ${name}`)
    return [name, spotifyID];
}