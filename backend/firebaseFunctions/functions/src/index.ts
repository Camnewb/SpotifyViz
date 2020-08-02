import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const cors = require('cors');
const corsHandler = cors({origin : true});

// aliasing types
type DocData = FirebaseFirestore.DocumentData;
type QuerySnap = FirebaseFirestore.QuerySnapshot< DocData >;
type QueryDocSnap = FirebaseFirestore.QueryDocumentSnapshot< DocData >;

admin.initializeApp();
const db = admin.firestore()


class Edge {
    source : string = "";
    target : string = "";
    constructor(source : string, target : string){
        this.source = source;
        this.target = target;
    }
}

export const getGraphFromRawSongs = functions.https.onRequest(async (request, response) => {

    // @ts-ignore
    // tslint:disable-next-line:no-empty
    corsHandler(request, response, async () =>  {
        try {
            // query paramters
            const songName : string = request.query.song as string;
            const songID : string = request.query.songID as string;
            const limit : number = parseInt(request.query.limit as string);
            // const connections: number = parseInt(request.query.connections as string);

            // Printing to check query parameters
            console.log(`songName: ${songName}, songID: ${songID}, limit: ${limit}, connections: (not yet implemented)`);        
            
            // getting root node song
            const songDoc : QueryDocSnap = await getRootDoc(songID, songName);
            
            // getting songs naively similar to songDoc
            const docsSimilar : QuerySnap = await getSimilarQuery(songDoc);
            
            const docList : Array<QueryDocSnap> = new Array<QueryDocSnap>();
            const nodeList : Array<Object> = new Array<Object>();
            
            // adding documents to docList and nodeList
            let includesRoot : Boolean = false;
            docsSimilar.forEach(document => {
                docList.push( document )
                nodeList.push( document.data() )

                if (document["id"] === (songDoc["id"])){
                    includesRoot = true;
                }
            });
            
            // if root was not in docs, add it.
            if (includesRoot === false){
                // mainting 50
                docList.pop()
                nodeList.pop()
                docList.push( songDoc )
                nodeList.push( songDoc.data() )
            }
            
            const edgeList : Array<Edge> = constructEdgeList(docList);

            response.send( JSON.stringify( {'nodes' : nodeList, 'edges' : edgeList}) );
        }
        catch (err){
            console.error(err);
            response.status(500).send(err);
        }

    });
});

async function getRootDoc(id : string, name: string) : Promise< QueryDocSnap > {
    let rootQuery : QuerySnap;
    if (id !== undefined){ // parse on songId
        const nameSongQuery = db.collection("raw_songs").where('id', '==', id).limit(1);
        rootQuery = await nameSongQuery.get();
    }
    else if (name !== undefined){ // parse on songName
        const nameSongQuery = db.collection("raw_songs").where('name', '==', name).limit(1);
        rootQuery = await nameSongQuery.get();
    }
    else{ // neither passed throw eror
        throw Error("Neither song name nor songId were passed");
    }

    if (rootQuery.empty){
        console.error("the document was empty")
        throw Error("Could not find song with that name"); }

    return rootQuery.docs[0];
}

async function getSimilarQuery(songDoc : QueryDocSnap) : Promise< QuerySnap > {
    const similarQuery = db.collection('raw_songs')
        .where('year', '==', songDoc.get('year') )
        .where('energy', '>=', songDoc.get('energy') - 0.04)
        .where('energy', '<=', songDoc.get('energy') + 0.04)
        .limit(50);
    return await similarQuery.get();
}

function constructEdgeList(nodeList : Array<QueryDocSnap>) : Array<Edge> {
    const edgeList : Array<Edge> = new Array<Edge>();
    nodeList.forEach(doc => {
        nodeList.sort( function (doc1 : Object, doc2: Object) : number {
            return compareSongs(doc, doc1) - compareSongs(doc, doc2);    
        });
        (nodeList.slice(0, 2)).forEach(simDoc => {
            const edge = new Edge( doc["id"], simDoc["id"] );
            edgeList.push(edge);
        });
    });
    
    return edgeList;
}

// TODO: implement actual logic
function compareSongs(song1 : Object, song2: Object) : number{
    return 0;
}