// From JSON file's nodes, get song data by name
function getSongByName(songName) {
    let data = getData()

    for (node of data.nodes) {
        if (node.name === songName) {
            return node
        }
    }
}
// From JSON file's nodes, get song data by ID
function getSongByID(songID) {
    let data = getData()
    for (node of data.nodes) {
        if (node.id === songID)
            return node
    }
}

// From JSON file's edge list, get neighbors by a song's ID
function getNeighbors(songID) {
    let data = getData()
    // from the song's JSON data, 
    // pull the edge list to see what neighbors the song has.
    var neighbors = []

    
    data.edges.forEach(function(edge) {
        if (edge.source === songID)
            neighbors.push(getSongByID(edge.target))
        else if (edge.target === songID) // Bi-directional
        neighbors.push(getSongByID(edge.source))

    })

    return neighbors
}

function breadthFS(parent, numResults) {
    var returnList = []

    var q = []
    q.unshift(parent) // FIRST IN
    
    var visited = []
    visited.push(parent)

    while (q.length > 0) {
        if (returnList.length === numResults+1)
            break
        
        var cur = q.shift()   
        returnList.push(cur)
        
        getNeighbors(cur.id).forEach(function(neighbor) {
            if (!visited.includes(neighbor)) {
                visited.push(neighbor)
                q.unshift(neighbor)
            }
        })
    }
    return returnList
}

// Generate edges needed for D3
function generateEdges(searchResult) {
    class Edge {
        constructor(source, target) {
            this.source = source;
            this.target = target;
        }
    }
    edges = []
    
    function getNextSong(songID) {
        let index = searchResult.indexOf(getSongByID(songID));
        if (index >= searchResult.length - 1 || index < 0)
            return null;
        else return searchResult[index + 1];
    }

    for (song of searchResult) {
        let nextSong = getNextSong(song.id)
        if (nextSong != null) {
                let newEdge = new Edge(song, nextSong)
                edges.push(newEdge)
            }
        }
    return edges
}