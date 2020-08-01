import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const cors = require('cors');
const corsHandler = cors({origin : true});


// const algoliasearch = require('algoliasearch');
// import algoliasearch from "algoliasearch";
// const ALGOLIA_APP_ID = '';
// const ALGOLIA_ADMIN_KEY = '';
// const ALOGOLIA_INDEX_NAME = 'raw_songs';


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
            const limit : number = parseInt(request.query.limit as string);
            // const connections: number = parseInt(request.query.connections as string);

            console.log(`songName: ${songName}, queryLimit: ${limit}`);        
            
            if (songName === undefined){ throw Error("Song name was not provided"); }

            // Getting song that was passed in query
            const nameSongQuery = db.collection("raw_songs").where('name', '==', songName).limit(1);
            const docsWithSongName = await nameSongQuery.get();
            if (docsWithSongName.empty){
                console.error("the document was empty")
                throw Error("Could not find song with that name"); }
            const songDoc = docsWithSongName.docs[0];
            
            // getting songs naively similar to that
            const similarQuery = db.collection('raw_songs')
                .where('year', '==', songDoc.get('year') )
                .where('energy', '>=', songDoc.get('energy') - 0.04)
                .where('energy', '<=', songDoc.get('energy') + 0.04)
                .limit(50);
            const docsSimilar = await similarQuery.get();
            
            const docList : Array<FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>> = new Array<FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>>();
            const nodeList : Array<Object> = new Array<Object>();
            nodeList.push( songDoc.data() );

            let includesRoot : Boolean = false;
            docsSimilar.forEach(document => {
                docList.push( document )
                nodeList.push( document.data() )

                if (document["id"] === (songDoc["id"])){
                    includesRoot = true;
                }
            });
            
            // Test this out
            if (includesRoot === false){
                // mainting 50
                docList.pop()
                nodeList.pop()
                // adding original song
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

function constructEdgeList(nodeList : Array<FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>>) : Array<Edge> {
    const edgeList : Array<Edge> = new Array<Edge>();
    nodeList.forEach(doc => {
        nodeList.sort( function (doc1 : Object, doc2: Object) : number {
            return compareSongs(doc, doc1) - compareSongs(doc, doc2);    
        });
        (nodeList.slice(1, 3)).forEach(simDoc => {
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