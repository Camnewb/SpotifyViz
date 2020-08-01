function getNeighbors(data) 
{
    data.shift()
    var neighbors = []

    return data.nodes
}

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
        
        getNeighbors(cur).foreach(function(neighbor)
        {
            if (!visited.includes(neighbor))
                visited.push(neighbor)
                q.unshift(neighbor)
        })
    }
    returnList.shift() // Remove parent
    return returnList
}