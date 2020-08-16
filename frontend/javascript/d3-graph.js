//-----------------------------------
//         d3-graph.js
//
//  Handles the graph-drawing and
// server requests for song searching
//-----------------------------------

//This code was based off of https://bl.ocks.org/jodyphelan/5dc989637045a0f48418101423378fbd

//=================================
//Initializing Canvas and Variables
//=================================

var radius = 10;//Radius of the nodes
var graphCanvas = d3.select("canvas").node();  //Canvas element where the graph will be drawn

//When the web page size changes, change the size of the canvas to match
function resizeCanvas() {
  //Canvas size constraints
  var height = window.innerHeight;
  var width =  window.innerWidth;

  graphCanvas = d3.select("canvas")
    .attr("height", height + "px")
    .attr("width", width + "px")
    .node();

    formatMobile();
}

resizeCanvas();

var context = graphCanvas.getContext("2d");//Context for drawing the graph

//Defining parameters for the "forces" between nodes
var simulation = d3.forceSimulation()
              .force("center", d3.forceCenter(window.innerWidth - (graphCanvas.width - 384) / 2, graphCanvas.height / 2))//Forcing the graph towards the center of the screen
              .force("charge", d3.forceManyBody())//Forces from nodes
              .force("link", d3.forceLink().id(function(node) { return node.id; }))//Forces from links
              .alphaTarget(0.5)//Initial graph movement
              .alphaDecay(0.1);//Physics slowdown after releasing drag

var transform = d3.zoomIdentity;//For zooming functionality

//For external access
var jsonData;
var songData;
function getData() {return jsonData;}

function getSearchResultsAsList() {
  if (searchType == 1) {
    return depthFS(songData);
  }
  
  else if (searchType == 2) {
    return breadthFS(songData);
  }

  else return jsonData.nodes;
}

//This function is from http://js-bits.blogspot.com/2010/07/canvas-rounded-corner-rectangles.html
//Draws a rounded rectangle in the canvas with the specified properties
function roundRect(ctx, x, y, width, height, radius, scaleFactor) {
  //Draw the rounded rectangle
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();

  //Draw a small triangle that points to the node, also scale it
  ctx.moveTo(x + width / 2 - 10 / scaleFactor, y + height);
  ctx.lineTo(x + width / 2, y + height + 10 / scaleFactor);
  ctx.lineTo(x + width / 2 + 10 / scaleFactor, y + height);
  ctx.fill();
}

//========================
//      HTTP Request
//========================
//Send an HTTP GET request to the server to retrieve the JSON data

//getDataAsynchronus does the GET request in the background, initializing the graph once the request is ready
function getDataAsynchronous(url, songName) {
  console.log("Sending request...");
  showLoader();//Show loading bar
  searchAlert(200);//Clear any alert text
  //Create the request object
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function (e) {
    //On state change, check if the request is ready
    if (this.readyState == 4) {
      searchAlert(this.status);
      if (this.status == 200) {
        //If it's ready, parse the JSON and call initGraph()
        console.log("Data recieved.");
        jsonData = JSON.parse(xhr.responseText);
        console.log(jsonData);
        songData = getSongByName(songName);
       
        initgraph(jsonData, songName);//Initialize the graph
        similarity("none");
      } else {
        console.error("Error: " + this.status);
      }
      hideLoader();//Hide loading bar
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
  console.log("Request sent. Waiting for response...");
}

//Processes a query from search(), gives the GET request URL to getDataAsynchronus()
function query(song) {
  console.log("Starting query for \"" + song + "\"");
  var songQuery = song.replace(/\ /g, "%20");//Replace spaces with %20
  var url = "https://us-central1-spotifyviz-68e56.cloudfunctions.net/getGraphFromRawSongs?song=" + songQuery;
  //console.log("GET Request url: " + url);
  getDataAsynchronous(url, song);

  //Restart the simulation so the nodes move after a query
  simulation.alphaTarget(0.5).restart();

  //Reset the frontend to before the last query was made
  //Clear the search window
  var searchDisplay = document.getElementById("search-list");
  searchDisplay.innerHTML = "";
  //Add the select search method text
  var span = document.createElement("span");
  span.innerText = "Select a search method";
  span.classList.add("text-muted");
  searchDisplay.appendChild(span);
  //Reset the toggle buttons
  document.getElementById("btn-depth").classList.remove("btn-active");
  document.getElementById("btn-breadth").classList.remove("btn-active");
  //Hide the animate search button
  document.getElementById("btn-animate").style.display = "none";
  //Make sure the search bar text is our new query
  document.getElementById("search-input").value = song;
  //Ensure the search bar has a height of 40px because it's dumb
  document.getElementById("autocomplete").setAttribute("style","height: 40px;");
  //Finally, resize the menu
  resizeMenu();
}

//Array of selected nodes. If a node is found in this array, it is highlighted in the graph
var selectedNodes = new Array();
//Adds a node to the highlight list
function selectNode(node) {
  selectedNodes.push(node);
}
//Removes a node from the highlight list
function deselectNode(node) {
  selectedNodes.splice(selectedNodes.indexOf(node), 1);
}
//Removes all nodes from the list
function deselectAll() {
  selectedNodes = new Array();
}

//Determines the percent difference between the propery of a song to the original song
//node.sim = -1 when no radio button is selected
function similarity(property) {
  if (jsonData == undefined) return;
  if (property == "Duration") property = "duration_ms";
  if (property == "none") {
    jsonData.nodes.forEach(node => node.sim = -1);
  } else {
    jsonData.nodes.forEach(function(node) {
      var actual = node[property.toLowerCase()];
      var current = songNode[property.toLowerCase()];
      if (actual == current) {
        node.sim = 1;
      } else if (actual == 0 || current == 0) {
        node.sim = 0;
      } else if (Math.abs(actual) < Math.abs(current)) {
        node.sim = Math.abs(actual / current);
      } else {    
        node.sim = Math.abs(current / actual);
      }
    });
  }
}

//========================
// Graph Initialization
//========================
var songNode;
function initgraph(results, songName) {

  //Write album_cover data for every song
  for (node of jsonData.nodes) {
    albumURL(node.id);
  }

  let nodes = results.nodes;
  let edges = results.edges;
 
  console.log("Drawing graph...");

  //========================
  // Zoom and Drag Functions
  //========================
  //Add the functions to the canvas
  d3.select(graphCanvas)
      .call(d3.drag().subject(dragsubject)
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end",dragended))
      .call(d3.zoom()
        .scaleExtent([1/2, 10])
        .on("zoom", zoomed)
      ); 

  //Determines which node to drag
  function dragsubject() {
    var i,
    x = transform.invertX(d3.event.x),
    y = transform.invertY(d3.event.y),
    dx, dy;
    for (i = nodes.length - 1; i >= 0; --i) {
      node = nodes[i];
      dx = x - node.x;
      dy = y - node.y;

      if (dx*dx + dy*dy < radius*radius) {
        node.x = transform.applyX(node.x);
        node.y = transform.applyY(node.y);
        return node;
      }
    }
  }

  //Drag functions. This is boilerplate code
  function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(1).restart();
    d3.event.subject.fx = transform.invertX(d3.event.x);
    d3.event.subject.fy = transform.invertY(d3.event.y);
  }

  function dragged() {
    d3.event.subject.fx = transform.invertX(d3.event.x);
    d3.event.subject.fy = transform.invertY(d3.event.y);
  }

  function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0.05);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }

  function zoomed() {
    transform = d3.event.transform;
    tick();
  }
  
  //Adding nodes and links to the simulation
  //The tick function that draws nodes will execute every tick
  simulation.nodes(nodes).on("tick", tick);
  simulation.force("link").links(edges);

  //Adds mouseover functionality to the nodes
  //Stolen from this stackoverflow thread: https://stackoverflow.com/questions/38271595/tooltips-with-canvas-networks
  var closeNode;
  d3.select("canvas").on("mousemove", function(){
    var mouse = transform.invert(d3.mouse(this));//Coordinates of the mouse must be inverted
    //Finds the node closest to the mouse coordinates. Returns undefined if the mouse is not within the node's radius
    closeNode = simulation.find(mouse[0], mouse[1], radius * 1.2);
    if (closeNode) tick();//Update the graph to show the highlighted node
  });
  //On mouse click of a node, open a google search for the song and artist
  d3.select("canvas").on("click", function(){
    if (closeNode) {
      var q = closeNode.name + " " + closeNode.artists[0];
      window.open('http://google.com/search?q=' + q);
    }
  });

  //========================
  //  Drawing the Graph
  //========================
  //Draws the nodes and edges of the graph each tick
  function tick() {
    //Start up the current drawing tick
    context.save();
    context.clearRect(0, 0, graphCanvas.width, graphCanvas.height);//Clear the canvas
    context.translate(transform.x, transform.y);//Pan the camera to the last state
    context.scale(transform.k, transform.k);//Zoom the camera to the last state

    //Draw the links between nodes
    edges.forEach(function(node) {
      let graphNodes = [node.source.graph_node, node.target.graph_node]
      //White line
      context.beginPath();
      context.moveTo(node.source.x, node.source.y);
      context.lineTo(node.target.x, node.target.y);
      if (selectedNodes.includes(graphNodes[0]) || selectedNodes.includes(graphNodes[1])
         || graphNodes[0] == closeNode || graphNodes[1] == closeNode) {
        context.strokeStyle = "#9e2c2c";
      } else context.strokeStyle = "#ffffff";
      context.lineWidth = 2;
      context.globalAlpha = 0.75;
      context.stroke();
    });

    //Draw the nodes
    nodes.forEach(function(node) {

       //If the current node is the searched/root node, make it bigger
      let localRadiusBorder = node.name == songName ? radius * 2.4 : radius * 1.2;
      let localRadiusFill = node.name == songName ? radius * 2 : radius;

      node.graph_node = node; // Save graph node info for edges.
      if (node.name == songName) songNode = node;

      context.beginPath();
      context.globalAlpha = 1;
     
      //If the node is selected or moused-over, fill the edge with red
      context.arc(node.x, node.y, localRadiusBorder, 0, 2 * Math.PI, true);
      if (selectedNodes.includes(node) || node == closeNode) {
        context.fillStyle = "#9e2c2c";
        
      } else context.fillStyle = "white";
      context.fill();  
      context.closePath();
      
      //Draw Fill (that will be replaced with an image)
      context.save()
      context.beginPath();
      context.arc(node.x, node.y, localRadiusFill, 0, 2 * Math.PI, true);
      let image; //Boolean flag that determines whether to draw node's album image
     
      if (node.sim >= 0) { //Color node based on similarity score
        image = false;
        let r = 255 - (255 * (node.sim))
        let g = 255 - (255 * (node.sim))
        let b = 255;
        context.fillStyle = "rgb(" + r + ", " + g + ", " + b + ")";
      }
      else {
        image = true;
        context.fillStyle = "white";
      }
      context.globalAlpha = 1;
      context.fill();
      context.closePath();
      
      if (image) {
        context.clip();
        let img = new Image();
        let length = localRadiusFill * 2.4;
        if (node.album_cover) {
          img.src = node.album_cover
          context.drawImage(img, node.x - length/2, node.y - length/2, length, length);
        } 
      }
      context.restore();
    });   
    
    nodes.forEach(function(node) {
      var scaleFactor = transform.k;
      //Mouseover 
      if (node == closeNode && node.sim < 0) {
        //Display the song's name over the node if it is moused-over
        //Draw a dark box behind the text
        context.font = "24px sans-serif";
        context.fillStyle = "#4f4f4f";
        var nameWidth = context.measureText(node.name).width;
        var artistWidth = context.measureText(node.artists[0]).width;
        var maxWidth = nameWidth > artistWidth ? nameWidth : artistWidth;
        context.font = 24 / scaleFactor + "px sans-serif";
        roundRect(context, node.x - ((maxWidth + 16) / 2) / scaleFactor, node.y - 88 / scaleFactor - 10, (maxWidth + 16) / scaleFactor, 74 / scaleFactor, 8 / scaleFactor, scaleFactor);
        //Draw the text
        context.fillStyle = "#ffffff";
        context.fillText(node.name, node.x - (nameWidth / 2) / scaleFactor, node.y - 62 / scaleFactor - 10);
        context.fillText(node.artists[0], node.x - (artistWidth / 2) / scaleFactor, node.y - 24 / scaleFactor - 10);
        context.closePath();
        //Line in-between
        context.beginPath();
        context.strokeStyle = "#ffffff"
        context.lineWidth = 2 / scaleFactor;
        context.moveTo(node.x - 10 / scaleFactor, node.y - 50 / scaleFactor - 10);
        context.lineTo(node.x + 10 / scaleFactor, node.y - 50 / scaleFactor - 10);
        context.stroke();
      } else if (node == closeNode && node.sim >= 0) {//If a similarity score exists, display the percentage
        //Display the song's name over the node if it is moused-over
        //Draw a dark box behind the text
        context.font = "24px sans-serif";
        context.fillStyle = "#4f4f4f";
        var percentage = (node.sim * 100).toPrecision(3) + "%";
        var percentageWidth = context.measureText(percentage).width;
        var nameWidth = context.measureText(node.name).width;
        var artistWidth = context.measureText(node.artists[0]).width;
        var maxWidth = nameWidth > artistWidth ? nameWidth : artistWidth;
        context.font = 24 / scaleFactor + "px sans-serif";
        roundRect(context, node.x - ((maxWidth + 16) / 2) / scaleFactor, node.y - 114 / scaleFactor - 10, (maxWidth + 16) / scaleFactor, 106 / scaleFactor, 8 / scaleFactor, scaleFactor);
        //Draw the text
        context.fillStyle = "#ffffff";
        context.fillText(node.name, node.x - (nameWidth / 2) / scaleFactor, node.y - 86 / scaleFactor - 10);
        context.fillText(node.artists[0], node.x - (artistWidth/ 2) / scaleFactor, node.y - 48 / scaleFactor - 10);
        context.fillText(percentage, node.x - ((percentageWidth - 16) / 2) / scaleFactor, node.y - 16 / scaleFactor - 10);
        context.closePath();
        //Line in-between
        context.beginPath();
        context.strokeStyle = "#ffffff"
        context.lineWidth = 2 / scaleFactor;
        context.moveTo(node.x - 10 / scaleFactor, node.y - 74 / scaleFactor - 10);
        context.lineTo(node.x + 10 / scaleFactor, node.y - 74 / scaleFactor - 10);
        context.stroke();
        context.closePath();
      }
    });
    //End drawing
    context.restore();
  }
  console.log("Done drawing graph.")
}
