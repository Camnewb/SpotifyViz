//This code was stolen from https://bl.ocks.org/jodyphelan/5dc989637045a0f48418101423378fbd
var radius = 5;

var defaultNodeCol = "white",
    highlightCol = "yellow";

var height = window.innerHeight - 100;
var graphWidth =  window.innerWidth;

var graphCanvas = d3.select('#graph-window').append('canvas')
.attr('width', graphWidth - 500 + 'px')
.attr('height', height + 'px')
.node();

var context = graphCanvas.getContext('2d');

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//Define parameters for the "forces" between nodes
var simulation = d3.forceSimulation()
              .force("center", d3.forceCenter(graphCanvas.width / 2, graphCanvas.height / 2))
              .force("charge", d3.forceManyBody())
              .force("link", d3.forceLink().id(function(d) { return d.id; }))
              .alphaTarget(0)
              .alphaDecay(0.05);

var transform = d3.zoomIdentity;

updateFile();

function updateFile() {

  var dataFile = 'data.json';

  d3.json(dataFile, function(error,data){
    console.log(data);
    initGraph(data);
    function initGraph(jsonData) {
      function zoomed() {
        console.log("zooming");
        transform = d3.event.transform;
        tick();
      }

      //Add drag and zoom functions to the canvas
      d3.select(graphCanvas)
          .call(d3.drag().subject(dragsubject)
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end",dragended))
          .call(d3.zoom()
          .scaleExtent([1/2, 10])
          .on("zoom", zoomed)); 

      //Drag function
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

      //Update graph while node is being dragged
      function dragstarted() {
        if (!d3.event.active) simulation.alphaTarget(0.7).restart();
        d3.event.subject.fx = transform.invertX(d3.event.x);
        d3.event.subject.fy = transform.invertY(d3.event.y);
      }

      function dragged() {
        d3.event.subject.fx = transform.invertX(d3.event.x);
        d3.event.subject.fy = transform.invertY(d3.event.y);
        console.log("dragged " + d3.event.subject.id + " to x= " + d3.event.x + ", y: " + d3.event.y)
      }

      function dragended() {
        if (!d3.event.active) simulation.alphaTarget(0.01);
        d3.event.subject.fx = null;
        d3.event.subject.fy = null;
      }

      //Add the nodes and links to the simulation
      simulation.nodes(jsonData.nodes).on("tick", tick);
      simulation.force("link").links(jsonData.edges);

      //Stolen from this stackoverflow thread: https://stackoverflow.com/questions/38271595/tooltips-with-canvas-networks
      var closeNode;
      d3.select("canvas").on("mousemove", function(d){
        var mouse = transform.invert(d3.mouse(this));
        console.log("Mouse is at x = " + mouse[0] + ", y = " + mouse[1])
        closeNode = simulation.find(mouse[0], mouse[1], radius);
        tick();
      })

      //Draws the nodes and edges using canvas every update
      function tick() {
        context.save();
        context.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
        context.translate(transform.x, transform.y);
        context.scale(transform.k, transform.k);

        jsonData.edges.forEach(function(d) {
          //Draw the edges between nodes
          context.beginPath();
          context.moveTo(d.source.x, d.source.y);
          context.lineTo(d.target.x, d.target.y);
          context.strokeStyle = defaultNodeCol;
          context.lineWidth = 2;
          context.globalAlpha = 0.75;
          context.stroke();
        });

        // Draw the nodes
        jsonData.nodes.forEach(function(d) {
          context.beginPath();
          context.arc(d.x, d.y, radius * 1.2, 0, 2 * Math.PI, true);
          context.fillStyle = "white";
          context.fill();
          context.closePath();
          context.beginPath();
          context.arc(d.x, d.y, radius, 0, 2 * Math.PI, true);
          context.fillStyle = "#3ca0f3";
          context.globalAlpha = 1;
          context.fill();
        });

        if (closeNode) {
          //console.log("Node x = " + closeNode.x + ", y = " + closeNode.y)
          context.beginPath();
          context.arc(closeNode.x, closeNode.y, radius, 0, 2 * Math.PI, true);
          context.fillStyle = "#9e2c2c";
          context.globalAlpha = 1;
          context.fill();
        }

        context.restore();
  //        transform = d3.zoomIdentity;
      }
    }
  })
}