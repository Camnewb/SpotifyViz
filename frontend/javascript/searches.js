function getNeighbors(JSONdata, song) 
{
    // from the song's JSON data, 
    // pull the edge list to see what neighbors the song has.
    var neighbors = []

    JSONdata.edges.forEach(function(edge)
    {
        if (edge.source == song.id)
            neighbors.push(getSong(JSONdata, song.name))

    })

    return neighbors
}

function getSong(JSONdata, songName)
{
    console.log(JSONdata.nodes)
    JSONdata.nodes.forEach(function(node)
    {
        if (node.name == songName)
            return node
    })
}

// var breadth = breadthFS(getSong(jsonData, song), 50)
// initgraph(breadth, song)

function breadthFS(parent, numResults)
{
    var returnList = []

    var q = []
    q.unshift(parent) // FIRST IN
    
    var visited = []
    visited.push(parent)

    while (q.length > 0)
    {
        if (returnList.length == numResults+1)
            break
        
        var cur = q.shift()   
        returnList.push(cur)
        
        getNeighbors(cur).forEach(function(neighbor)
        {
            if (!visited.includes(neighbor))
                visited.push(neighbor)
                q.unshift(neighbor)
        })
    }
    returnList.shift() // Remove parent
    return returnList
}

function generateEdges(data)
{
    
}