// From JSON file's nodes, get song data by name
function getSongByName(songName) {
    //console.log("searching for " + songName)
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

    })

    return neighbors
}

// var breadth = breadthFS(getSong(jsonData, song), 50)
// initgraph(breadth, song)

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
    //returnList.shift() // Remove parent
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
    visited = []
    for (song of searchResult) {
        //https://stackoverflow.com/questions/12433604/how-can-i-find-matching-values-in-two-arrays/12433654
       let validNeighbors = getNeighbors(song.id).filter(element => searchResult.includes(element));
        for (n of validNeighbors) {
            if (!visited.includes(n)) {
                let newEdge = new Edge(song, n)
                edges.push(newEdge)
            }
        }
    }
    return edges
}