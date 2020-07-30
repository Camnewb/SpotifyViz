//This code is based off of https://bl.ocks.org/jodyphelan/5dc989637045a0f48418101423378fbd

//========================
//   Defining variables
//========================

var radius = 5;//Radius of the nodes

//Canvas size constraints
var height = d3.select("#graph-window").node().getBoundingClientRect().height;
var width =  d3.select("#graph-window").node().getBoundingClientRect().width;

//Canvas element where the graph will be drawn
var graphCanvas = d3.select("#graph-window").append("canvas")
.attr("height", height + "px")
.attr("width", width + "px")
.node();

var context = graphCanvas.getContext("2d");//Context for drawing the graph

//Defining parameters for the "forces" between nodes
var simulation = d3.forceSimulation()
              .force("center", d3.forceCenter(graphCanvas.width / 2, graphCanvas.height / 2))//Forcing the graph towards the center of the screen
              .force("charge", d3.forceManyBody())//Force from noeds
              .force("link", d3.forceLink().id(function(d) { return d.id; }))//Force from links
              .alphaTarget(0.5)//Initial graph movement
              .alphaDecay(0.05);//Physics slow down after releasing drag

var transform = d3.zoomIdentity;//For zooming functionality

//========================
//      HTTP Request
//========================
//Send an HTTP get request to the server to retrieve the JSON data
//Synchronus freezes the site while waiting for the request to finish
//Asynchronus does the server request in the background, initializing the graph once the request is ready

// function getDataSynchronous(url) {
//   //Get request for the json data
//   //TODO This needs to be turned into an asynchronus request
//   console.log("Sending request...");
//   var Httpreq = new XMLHttpRequest();
//   Httpreq.open("GET", url, false);
//   Httpreq.setRequestHeader("X-Requested-With", "XMLHttpRequest");
//   Httpreq.send(null);
//   console.log("Data recieved...");
//   console.log("JSON: " + Httpreq.responseText);
//   return Httpreq.responseText; 
// }

function getDataAsynchronous(url) {
  // console.log("Sending request...");
  // var xhr = new XMLHttpRequest();
  // xhr.open("GET", url, true);
  // xhr.onload = function (e) {
  //   if (xhr.readyState === 4) {
  //     if (xhr.status === 200) {
  //       console.log(xhr.responseText);
  //       return xhr.responseText;
  //     } else {
  //       console.log(xhr.statusText);
  //     }
  //   }
  // };
  // xhr.onerror = function (e) {
  //   console.log(xhr.statusText);
  // };
  // xhr.send(null);
  // console.log("Data recieved...");
  // console.log("JSON: " + xhr.responseText);
  console.log("Sending request...");
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function (e) {
    if (this.readyState == 4 && this.status == 200) {
      console.log("Data Recieved: " + xhr.responseText);
      var jsonData = JSON.parse(xhr.responseText);
      initgraph(jsonData);
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
  console.log("Request sent. Waiting for response...");
  // console.log("JSON: " + xhr.responseText);
  
}

//query("American Idiot")
function query(song) {
  console.log("Starting query for " + song);
  song = song.replace(/\ /g, "%20");//Replace spaces with %20
  var url = /*"https://cors-anywhere.herokuapp.com/" + */"https://us-central1-spotifyviz-68e56.cloudfunctions.net/getGraphFromRawSongs?song=" + song;
  console.log("GET Request url: " + url);
  getDataAsynchronous(url);
}

//========================
// Graph Initialization
//========================

function initgraph(jsonData) {

  if (jsonData == undefined) {
    console.log("JSON data is empty.");
    return;
  } else {
    console.log("JSON data parsed: " + jsonData)
  }

  //var dataFile = "reformatted_sample_graph.json";

  // d3.json(dataFile, function(error,data){
  //   console.log(data);
  function zoomed() {
    //console.log("zooming");
    transform = d3.event.transform;
    tick();
  }

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
      .on("zoom", zoomed)); 

  //Determines which node to drag
  function dragsubject() {
    var i,
    x = transform.invertX(d3.event.x),
    y = transform.invertY(d3.event.y),
    dx, dy;
    for (i = jsonData.nodes.length - 1; i >= 0; --i) {
      node = jsonData.nodes[i];
      dx = x - node.x;
      dy = y - node.y;

      if (dx*dx + dy*dy < radius*radius) {
        node.x = transform.applyX(node.x);
        node.y = transform.applyY(node.y);
        return node;
      }
    }
  }

  //Drag functions
  function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.7).restart();
    d3.event.subject.fx = transform.invertX(d3.event.x);
    d3.event.subject.fy = transform.invertY(d3.event.y);
  }

  function dragged() {
    d3.event.subject.fx = transform.invertX(d3.event.x);
    d3.event.subject.fy = transform.invertY(d3.event.y);
    //console.log("dragged " + d3.event.subject.id + " to x= " + d3.event.x + ", y: " + d3.event.y)
  }

  function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0.01);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }

  //Adding nodes and links to the simulation
  //The tick function that draws nodes will execute every tick
  simulation.nodes(jsonData.nodes).on("tick", tick);
  simulation.force("link").links(jsonData.edges);

  //Adds mouseover functionality to the nodes
  //Stolen from this stackoverflow thread: https://stackoverflow.com/questions/38271595/tooltips-with-canvas-networks
  var closeNode;
  d3.select("canvas").on("mousemove", function(){
    var mouse = transform.invert(d3.mouse(this));
    //console.log("Mouse is at x = " + mouse[0] + ", y = " + mouse[1])
    closeNode = simulation.find(mouse[0], mouse[1], radius);
    tick();
  })
  //On mouse click of a node, open a google search for the song and artist
  d3.select("canvas").on("click", function(){
    if (closeNode) {
      var q = closeNode.name + " " + closeNode.artists[0];
      window.open('http://google.com/search?q=' + q);
    }
  })

  //========================
  //  Drawing the Graph
  //========================
  //Draws the nodes and edges of the graph every tick
  function tick() {
    //Start up the next drawing tick
    context.save();
    context.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    context.translate(transform.x, transform.y);
    context.scale(transform.k, transform.k);

    //Drawing the linke between nodes
    jsonData.edges.forEach(function(d) {
      context.beginPath();
      context.moveTo(d.source.x, d.source.y);
      context.lineTo(d.target.x, d.target.y);
      context.strokeStyle = "#ffffff";
      context.lineWidth = 2;
      context.globalAlpha = 0.75;
      context.stroke();
    });

    // Draw the nodes
    jsonData.nodes.forEach(function(d) {
      //White border
      context.beginPath();
      context.arc(d.x, d.y, radius * 1.2, 0, 2 * Math.PI, true);
      context.fillStyle = "white";
      context.fill();
      context.closePath();
      //Blue fill
      context.beginPath();
      context.arc(d.x, d.y, radius, 0, 2 * Math.PI, true);
      context.fillStyle = "#3ca0f3";
      context.globalAlpha = 1;
      context.fill();
    });

    //If the mouse is over a node
    if (closeNode) {
      //console.log("Node x = " + closeNode.x + ", y = " + closeNode.y)
      //Fill with red
      context.beginPath();
      context.arc(closeNode.x, closeNode.y, radius, 0, 2 * Math.PI, true);
      context.fillStyle = "#9e2c2c";
      context.fill();
      //Display the song's name
      context.fillStyle = "#ffffff"
      context.font = "12px sans-serif";
      context.fillText(closeNode.name, closeNode.x - closeNode.name.length * 6 / 2, closeNode.y - 12);
      context.globalAlpha = 1;
    }
    
    //End drawing
    context.restore();
  }
//});
}