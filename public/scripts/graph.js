import { convertToGraph, returnUser } from "./fire.js";

const expanded = [];
const imagePaths = [
    "../assets/profiles/Person1.jpeg",
    "../assets/profiles/Person2.jpeg",
    "../assets/profiles/Person3.jpeg",
    "../assets/profiles/Person4.jpeg",
    "../assets/profiles/Person5.jpeg",
    "../assets/profiles/Person6.jpeg",
    "../assets/profiles/Person7.jpeg",
    "../assets/profiles/Person8.jpeg",
    "../assets/profiles/Person9.jpeg",
    "../assets/profiles/Person10.jpeg",
    "../assets/profiles/Person11.jpeg",
    "../assets/profiles/Person12.jpeg",
    "../assets/profiles/Person13.jpeg",
    "../assets/profiles/Person14.jpeg",
    "../assets/profiles/Person15.jpeg"
];
const nodesMap = new Map();

function ticked(s) {
    const all_nodes = s.selectAll("image");
    all_nodes
      .attr("x", function(d, i) { 
        s.select(`#myMask${i} circle`)
            .attr("cx", d.x );
        return d.x - 10; 
    })
      .attr("y", function(d, i) { 
        s.select(`#myMask${i} circle`)
            .attr("cy", d.y);
        return d.y - 10; });
    const all_links = s.selectAll("line");
    all_links
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
}

function initializeGraph(containerId, width, height) {
    const svg = d3.select(containerId).append("svg")
        .attr("width", width)
        .attr("height",height)

    // Add a group for the zoomable content
    const zoomGroup = svg.append("g");

    // Add a background rectangle for capturing zoom/pan events
    zoomGroup.append("rect")
        .attr("width", width)
        .attr("height",height)
        .style("fill", "none")
        .style("pointer-events", "all")  // Ensure the rectangle captures all pointer events

    // Apply the zoom behavior to the entire SVG
    svg.call(d3.zoom().on("zoom", (event) => {
        zoomGroup.attr("transform", event.transform);
    }));

    return zoomGroup;

    // svg.call(d3.zoom().on("zoom", (event) => {
    //     svg.attr("transform", event.transform);
    // }));

    // return svg;
}
function encodeId(id) {
    return id.replace(/[@.]/g, "-");
}

async function createOrUpdateNodes(svg, nodesData, linksData, simulation, recommendationData, initId, defs) {
    const radius = 10;
    const fill = "#69b3a2";

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

    const nodes = svg.selectAll("image")
        .data(nodesData, d => d.id); // Use unique ID for key

  
    nodes.enter()
        .append("image")
        .attr("href", imagePaths[0])
        .attr("height", 20)
        .attr("width", 20)
        .attr("mask", (d, i) => `url(#myMask${i})`)
        // .append("circle")
        // .attr("r", 5)
        .merge(nodes) // Merge enter and update selections
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .on('click',  handleMouseClick)
        .on('contextmenu',  handleMouseRightClick)
        .raise()
        .each(async function(d, i) {
            nodesMap.set(d.id, d);
            const mask = svg.append("mask")
                .attr("id", `myMask${i}`);

            mask.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "black");

            mask.append("circle")
            .attr("fill", "white")
            .attr("r", "10");

        });

    nodes.exit().remove();

    function handleMouseRightClick(event, d){
        event.preventDefault();
        const profileInfo = document.querySelector("#profile-info");
        const nameInfo = profileInfo.querySelector("#name-info");
        const picInfo = profileInfo.querySelector("#picture-info");
        const interestsInfo = profileInfo.querySelectorAll(".interest-info"); // Correct selector

        nameInfo.innerHTML = d.name;
        picInfo.src =  d.imagePath;

        for (let i = 0; i < 4; i++){
            if (d.interests[i]) {
                interestsInfo[i].innerHTML = d.interests[i];
            } else {
                interestsInfo[i].innerHTML = ""; // Clear if there's no interest
            }
        }
    }

    async function handleMouseClick(event, d) {
        for (let expandedNodeId of expanded){
            if (d.id === expandedNodeId){
                return;
            }   
        }
        const currNodeGraphData = await convertToGraph(d.id);
        expanded.push(d.id);
        modifyNode(d.id);
        for (let currNodeGraphDataNode of currNodeGraphData.nodes){
            if (currNodeGraphDataNode.id !== d.id && !nodesMap.has(currNodeGraphDataNode.id)){
                addNode(svg, currNodeGraphDataNode, nodesData, linksData, simulation, recommendationData, initId, defs);
            }
        }
        for (let currNodeGraphDataLink of currNodeGraphData.links){
            addLink(svg, currNodeGraphDataLink.source, currNodeGraphDataLink.target, linksData, nodesData, simulation, false);
        }
            // Update existing green dashed links to white
        svg.selectAll("line")
            .filter(d => d.source.id === d.id || d.target.id === d.id)
            .style("stroke", "#fff")
            .style("stroke-dasharray", null); // Remove dash pattern for white links

        checkRecommendations(recommendationData, svg, initId, linksData, nodesData, simulation);
    }

    function handleMouseOver(event, d) {
        // const currNode = d3.select(this);
        // currNode
        //     .style("fill", "#000000")
        //     .style("transform", "scale(1)")
        //     .style("transition", "transform 0.5s ease-in-out")
        //     .style("transform-origin", `${currNode.attr("cx")}px ${currNode.attr("cy")}px` );
    }

    function handleMouseOut(event, d) {
        // const currNode = d3.select(this);
        // const encodedId = encodeId(d.id); // Encode the ID here too
        // currNode
        //     .style("fill",`url(#pattern-${encodedId})`)
        //     .style("transform", "scale(1)")
        //     .style("transition", "transform 0.5s ease-in-out")
        //     .style("transform-origin", `${currNode.attr("cx")}px ${currNode.attr("cy")}px` );
    }

    simulation.nodes(nodesData).on("tick", () => ticked(svg));
}

function createOrUpdateLinks(svg, linksData, simulation, isRecommendationLink) {
    // Convert nodesData to a map for quick lookup
    // const nodesMap = new Map(nodesData.map(d => [d.id, d]));
    // Ensure linksData uses node objects instead of IDs
    const links = svg.selectAll("line")
        .data(linksData);

   // Handle entering links
    const enterSelection = links.enter()
    .append("line")
    .style("stroke", d => {
        // Prioritize #aaa stroke if the link is both a normal and recommendation link
        if (!isRecommendationLink) {
            return "#aaa";
        } else {
            return "green";
        }
    })
    .style("stroke-dasharray", isRecommendationLink ? "5, 5" : null)
    .lower();

    links.exit().remove();

    simulation.force("link", d3.forceLink(linksData).id(d => d.id)).on("tick", () => ticked(svg));
}

function addLink(svg, sourceId, targetId, linksData, nodesData, simulation, isRecommendationLink) {
    const nodeMap = new Map(nodesData.map(node => [node.id, node]));
    const sourceNode = nodeMap.get(sourceId);
    const targetNode = nodeMap.get(targetId);
    
    linksData.push({ "source": sourceNode, "target": targetNode });

    createOrUpdateLinks(svg, linksData, simulation, isRecommendationLink);
}


function addNode(svg, newNodeData, nodesData, linksData, simulation, recommendationData, initData, defs) {
    const centerX = window.innerWidth/2;
    const centerY = window.innerHeight/2;
    nodesData.push({ 
        "id": newNodeData.id, 
        "name": newNodeData.name, 
        "friends": newNodeData.friends, 
        "interests": newNodeData.interests,
        "x": centerX,  // Set initial x position
        "y": centerY   // Set initial y position
    });

    createOrUpdateNodes(svg, nodesData, linksData, simulation, recommendationData, initData, defs);
}

function modifyLink(sourceId, targetId) {
    const link = d3.selectAll("line").filter((d) => {
        return d.source.id === sourceId && d.target.id === targetId
    })
    link.style("stroke", "#000000");
}

function modifyNode(Id) {
    const node = d3.selectAll("image").filter((d) => {
        return d.id === Id;
    })
    node.style("stroke", "orange")
        .style("stroke-width", "3")
}

function mapLinksToNodes(nodes, links) {
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    links.forEach(link => {
        link.source = nodeMap.get(link.source);
        link.target = nodeMap.get(link.target);
    });
}

function checkRecommendations(recommendationData, svg, initId, linkData, nodeData, simulation){
    for (let data of recommendationData){
        if (nodesMap.has(data[0])){
            addLink(svg, initId, data[0], linkData, nodeData, simulation, true);
        } 
    }
}

export async function graphInit(recommendationData){
    const initId = "amelia.johnson@gmail.com";
    const data = await convertToGraph(initId);
    expanded.push(initId);

    mapLinksToNodes(data.nodes, data.links); // Map string IDs to node references

    const width = window.innerWidth;
    const height = window.innerHeight;
    const svg = initializeGraph("#connections-view", width, height);
    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink(data.links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const defs = svg.append("defs");

    createOrUpdateLinks(svg, data.links, simulation, false);
    await createOrUpdateNodes(svg, data.nodes, data.links, simulation, recommendationData, initId, defs);
    checkRecommendations(recommendationData, svg, initId, data.links, data.nodes, simulation);

    modifyNode(initId);


    /*
    // Example usage to add a new link
    // NOTE: please add the nodes before the links, I have no idea what happens if you try to add a link with a nonexistent node
    addLink(svg, "andy@email.com", "george@email.com", data.links, data.nodes, simulation);

    // Example usage to add a new node
    const newTestNode = {
        "id": "sarah@email.com", 
        "name": "Sarah",
        "friends": ["andy@email.com", "ella@email.com", "harry@email.com"], 
        "interests": ["painting", "traveling", "reading"]
    };
    addNode(svg, newTestNode, data.nodes, simulation);
    addLink(svg, "sarah@email.com", "andy@email.com", data.links, data.nodes, simulation);

    // Example usage to modify a link
    modifyLink("andy@email.com", "george@email.com");

    // Example usage to modify a node
    modifyNode("sarah@email.com");
    */
}

