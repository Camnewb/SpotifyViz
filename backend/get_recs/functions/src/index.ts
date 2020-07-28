import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore()

export const getLocalGraph = functions.https.onRequest(async (request, response) => {
    try{
        // Pulling in query variables
        const songName : string = request.query.song as string;
        const queryLimit : number = parseInt(request.query.limit as string);

        // initializing objects for making json Object
        const nodeList : Array<Object> = new Array<Object>();
        // const edgeList : Array<Object> = new Array<Object>();

        // making sure song name was really passed in
        if (songName === undefined){
            throw Error("Song name was not provided");
        }
        
        console.log(`Song name ${songName}, queryLimit: ${queryLimit}`);
        
        // retrieving firestore doc for passed in song name
        const query = db.collection("songs").where('name', '==', songName).limit(1);
        const docsWithSongName = await query.get();
        
        // making sure document with that name really exists. If not throw error.
        if (docsWithSongName.empty){
            console.error("the document was empty")
            throw Error("That song does not exist in our database");
        }
        const songDoc = docsWithSongName.docs[0];

        // Pushing that node data into nodeList
        nodeList.push( songDoc.data() ); 
        
        // putting initial node in format of rest of queue 
        const songNameIDCombo : string = songDoc.get("name") + "|" + songDoc.get("id");
        console.log(`songDoc combo: ${songNameIDCombo}`);

        // initializing traversal variables
        const queue : Array<string> = [];
        const visited : Set<string> = new Set();
        let popped : number = 0;

        // Initialzing queue and set with connected from original song
        queue.push(songNameIDCombo);
        visited.add(songNameIDCombo);
        
        while ((popped <= queryLimit) && queue.length !== 0){
            const curSong : string = queue.shift() as string;
            popped += 1

            const curSongSpotifyID : string = getSpotifyID(curSong)[1];

            if (curSongSpotifyID === undefined){
                continue;
            }
            
            const doc = await getDoc(curSongSpotifyID);

            nodeList.push( doc.data() );

            const docConnectedTo : Array<string> = doc.get("connected_to");
            docConnectedTo.forEach( (songCombo : string ) => {
                if (!visited.has(songCombo)){
                    visited.add(songCombo);
                    queue.push(songCombo);
                }
            });
        }
        
        response.send( "test " + JSON.stringify( {"nodes" : nodeList} ) );
    }
    catch (err){
        response.status(500).send(err);
        
    }
});

// 
async function getDoc(spotifyID : string) {
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
