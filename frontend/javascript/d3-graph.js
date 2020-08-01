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

var radius = 5;//Radius of the nodes

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
}

resizeCanvas();

var context = graphCanvas.getContext("2d");//Context for drawing the graph

//Defining parameters for the "forces" between nodes
var simulation = d3.forceSimulation()
              .force("center", d3.forceCenter(window.innerWidth - (graphCanvas.width - 384) / 2, graphCanvas.height / 2))//Forcing the graph towards the center of the screen
              .force("charge", d3.forceManyBody())//Forces from nodes
              .force("link", d3.forceLink().id(function(d) { return d.id; }))//Forces from links
              .alphaTarget(0.5)//Initial graph movement
              .alphaDecay(0.05);//Physics slowdown after releasing drag

var transform = d3.zoomIdentity;//For zooming functionality

//For external access
var jsonData;
function getData() {return jsonData;}

//========================
//      HTTP Request
//========================
//Send an HTTP GET request to the server to retrieve the JSON data

//getDataAsynchronus does the GET request in the background, initializing the graph once the request is ready
function getDataAsynchronous(url, song) {
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
        initgraph(jsonData, song);//Initialize the graph
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
}

//========================
// Graph Initialization
//========================

function initgraph(data, song) {

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
    for (i = data.length - 1; i >= 0; --i) {
      node = data


[i];
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
    if (!d3.event.active) simulation.alphaTarget(0.7).restart();
    d3.event.subject.fx = transform.invertX(d3.event.x);
    d3.event.subject.fy = transform.invertY(d3.event.y);
  }

  function dragged() {
    d3.event.subject.fx = transform.invertX(d3.event.x);
    d3.event.subject.fy = transform.invertY(d3.event.y);
  }

  function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0.01);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }

  function zoomed() {
    transform = d3.event.transform;
    tick();
  }
  
  //Adding nodes and links to the simulation
  //The tick function that draws nodes will execute every tick
  simulation.nodes(data).on("tick", tick);
  simulation.force("link").links(jsonData.edges);

  //Adds mouseover functionality to the nodes
  //Stolen from this stackoverflow thread: https://stackoverflow.com/questions/38271595/tooltips-with-canvas-networks
  var closeNode;
  d3.select("canvas").on("mousemove", function(){
    var mouse = transform.invert(d3.mouse(this));//Coordinates of the mouse must be inverted
    //Finds the node closest to the mouse coordinates. Returns undefined if the mouse is not within the node's radius
    closeNode = simulation.find(mouse[0], mouse[1], radius);
    tick();//Update the graph to show the highlighted node
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

    //Draw the linke between nodes
    jsonData.edges.forEach(function(d) {
      //White line
      context.beginPath();
      context.moveTo(d.source.x, d.source.y);
      context.lineTo(d.target.x, d.target.y);
      context.strokeStyle = "#ffffff";
      context.lineWidth = 2;
      context.globalAlpha = 0.75;
      context.stroke();
    });

    //console.log(song);

    //Draw the nodes
    data.forEach(function(d) {
      //White border
      context.beginPath();
      //If the current node is the searched/root node, make it bigger
      context.arc(d.x, d.y, d.name == song ? radius * 1.8 : radius * 1.2, 0, 2 * Math.PI, true);
      context.fillStyle = "white";
      context.fill();
      context.closePath();
      //Blue fill
      context.beginPath();
      context.arc(d.x, d.y, d.name == song ? radius * 1.5 : radius, 0, 2 * Math.PI, true);
      context.fillStyle = "#3ca0f3";
      context.globalAlpha = 1;
      context.fill();
    });

    //If the mouse is over a node, same as (closeNode != undefined)
    if (closeNode) {
      //Fill with red
      context.beginPath();
      context.arc(closeNode.x, closeNode.y, closeNode.name == song ? radius * 1.5 : radius, 0, 2 * Math.PI, true);
      context.fillStyle = "#9e2c2c";
      context.fill();
      //Display the song's name over the node
      context.fillStyle = "#ffffff"
      context.font = "12px sans-serif";
      context.fillText(closeNode.name, closeNode.x - closeNode.name.length * 6 / 2, closeNode.y - 12);
      context.globalAlpha = 1;
    }
    
    //End drawing
    context.restore();
  }

  console.log("Done drawing graph.")
}