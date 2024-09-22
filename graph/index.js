const data = {
  "nodes": [
    { "id": "andy@email.com", "name": "Andy", "friends": ["barry@email.com", "charlie@email.com", "diana@email.com"], "interests": ["sports", "travel", "cooking"] },
    { "id": "barry@email.com", "name": "Barry", "friends": ["andy@email.com", "diana@email.com", "george@email.com"], "interests": ["baseball", "hiking", "cooking"] },
    { "id": "charlie@email.com", "name": "Charlie", "friends": ["andy@email.com", "ella@email.com", "fiona@email.com"], "interests": ["gaming", "tech", "sci-fi"] },
    { "id": "diana@email.com", "name": "Diana", "friends": ["barry@email.com", "andy@email.com", "ella@email.com", "ivan@email.com"], "interests": ["reading", "travel", "yoga"] },
    { "id": "ella@email.com", "name": "Ella", "friends": ["charlie@email.com", "diana@email.com", "kate@email.com"], "interests": ["photography", "fashion", "travel"] },
    { "id": "fiona@email.com", "name": "Fiona", "friends": ["charlie@email.com", "george@email.com"], "interests": ["gardening", "literature", "tech"] },
    { "id": "george@email.com", "name": "George", "friends": ["harry@email.com", "fiona@email.com", "barry@email.com"], "interests": ["cycling", "tech", "travel"] },
    { "id": "harry@email.com", "name": "Harry", "friends": ["george@email.com", "ivan@email.com", "julia@email.com"], "interests": ["photography", "travel", "cooking"] },
    { "id": "ivan@email.com", "name": "Ivan", "friends": ["harry@email.com", "diana@email.com"], "interests": ["technology", "gaming", "cooking"] },
    { "id": "julia@email.com", "name": "Julia", "friends": ["kate@email.com", "harry@email.com"], "interests": ["running", "travel", "fashion"] },
    { "id": "kate@email.com", "name": "Kate", "friends": ["julia@email.com", "ella@email.com"], "interests": ["cycling", "yoga", "tech"] }
  ],
  "links": [
    { "source": "andy@email.com", "target": "barry@email.com" },
    { "source": "andy@email.com", "target": "charlie@email.com" },
    { "source": "barry@email.com", "target": "diana@email.com" },
    { "source": "charlie@email.com", "target": "ella@email.com" },
    { "source": "diana@email.com", "target": "ella@email.com" },
    { "source": "charlie@email.com", "target": "fiona@email.com" },
    { "source": "george@email.com", "target": "harry@email.com" },
    { "source": "harry@email.com", "target": "ivan@email.com" },
    { "source": "julia@email.com", "target": "kate@email.com" },
    { "source": "diana@email.com", "target": "ivan@email.com" },
    { "source": "george@email.com", "target": "fiona@email.com" },
    { "source": "ella@email.com", "target": "kate@email.com" },
    { "source": "barry@email.com", "target": "george@email.com" },
    { "source": "fiona@email.com", "target": "charlie@email.com" },
    { "source": "ivan@email.com", "target": "harry@email.com" },
    { "source": "harry@email.com", "target": "julia@email.com" }
  ]
}

// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 40}
const width = 500;
const height = 500;

// append the svg object to the body of the page
const svg = d3.select("#container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .call(d3.zoom().on("zoom", (event) => {
    d3.select("svg g")
      .attr("transform", event.transform)
}))


const foo = (data) => {
  // Initialize the links
  const link = svg
    .selectAll("line")
    .data(data.links)
    .join("line")
      .style("stroke", "#aaa")

  // Initialize the nodes
  const node = svg
    .selectAll("circle")
    .data(data.nodes) 
    .join("circle")
      .attr("r", 20)
      .style("fill", "#69b3a2")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on('mouseover', function() {
        const currNode = d3.select(this);
        currNode
          .style("fill", "#000000")
          .style("transform", "scale(1.15)")
          .style("transition", "transform 0.5s ease-in-out")
          .style("transform-origin", `${currNode.attr("cx")}px ${currNode.attr("cy")}px` )       
        })
      .on('mouseout', function() {
        d3.select(this).style("fill", "#69b3a2");
        const currNode = d3.select(this);
        currNode
          .style("fill", "#69b3a2")
          .style("transform", "scale(1)")
          .style("transition", "transform 0.5s ease-in-out")
          .style("transform-origin", `${currNode.attr("cx")}px ${currNode.attr("cy")}px` ) 
      });

  
  const simulation = d3.forceSimulation(data.nodes)
  .force("link", d3.forceLink(data.links).id(d => d.id).distance(50))
  .force("charge", d3.forceManyBody().strength(-300))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .on("tick", ticked);

function ticked() {
  node
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });

  link
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });
  }

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();  // Reheats the simulation
    d.fx = d.x;  // Fixes the position of the node
    d.fy = d.y;
  }
  
  // Function called while dragging
  function dragged(event, d) {
    d.fx = event.x;  // Sets the fixed x position of the node
    d.fy = event.y;  // Sets the fixed y position of the node
  }
  
  // Function called when drag ends
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);  // Cools down the simulation
    d.fx = null;
    d.fy = null;
  }
}


// function addLink(svg, linkData){
//   svg
//     .selectAll("line")
//     .data(linkData)
//     .join("line")
//       .style("stroke", "#aaa")
// }

// const bar = [{ "source": 2, "target": 3 }]

// addLink(svg, bar);
foo(data);