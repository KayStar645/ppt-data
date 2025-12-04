// Sample social network
const network = {
    nodes: [
        {id: 'A', name: 'Alice'},
        {id: 'B', name: 'Bob'},
        {id: 'C', name: 'Charlie'},
        {id: 'D', name: 'Diana'},
        {id: 'E', name: 'Eve'},
        {id: 'F', name: 'Frank'}
    ],
    links: [
        {source: 'A', target: 'B'},
        {source: 'A', target: 'C'},
        {source: 'B', target: 'C'},
        {source: 'B', target: 'D'},
        {source: 'C', target: 'D'},
        {source: 'C', target: 'E'},
        {source: 'D', target: 'E'},
        {source: 'D', target: 'F'},
        {source: 'E', target: 'F'}
    ]
};

function calculateCentrality() {
    // Degree Centrality
    const degree = {};
    network.nodes.forEach(node => {
        degree[node.id] = network.links.filter(
            link => link.source === node.id || link.target === node.id
        ).length;
    });
    
    // Betweenness Centrality (simplified)
    const betweenness = {};
    network.nodes.forEach(node => {
        betweenness[node.id] = calculateBetweenness(node.id);
    });
    
    displayCentralityResults(degree, betweenness);
    visualizeNetwork();
}

function calculateBetweenness(nodeId) {
    // Simplified betweenness calculation
    let count = 0;
    network.nodes.forEach(source => {
        network.nodes.forEach(target => {
            if (source.id !== target.id && source.id !== nodeId && target.id !== nodeId) {
                // Check if nodeId is on shortest path (simplified)
                const path = findShortestPath(source.id, target.id);
                if (path && path.includes(nodeId)) {
                    count++;
                }
            }
        });
    });
    return count;
}

function findShortestPath(source, target) {
    // BFS to find shortest path
    const queue = [[source]];
    const visited = new Set([source]);
    
    while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];
        
        if (current === target) return path;
        
        network.links.forEach(link => {
            let next;
            if (link.source === current) next = link.target;
            else if (link.target === current) next = link.source;
            else return;
            
            if (!visited.has(next)) {
                visited.add(next);
                queue.push([...path, next]);
            }
        });
    }
    return null;
}

function displayCentralityResults(degree, betweenness) {
    const resultDiv = document.getElementById('centrality-result');
    resultDiv.style.display = 'block';
    
    const sortedDegree = Object.entries(degree)
        .sort((a, b) => b[1] - a[1])
        .map(([id, value]) => ({id, value}));
    
    const sortedBetweenness = Object.entries(betweenness)
        .sort((a, b) => b[1] - a[1])
        .map(([id, value]) => ({id, value}));
    
    let html = '<div class="grid-2">';
    
    html += '<div><h3>Degree Centrality:</h3>';
    html += '<div class="table-container"><table><thead><tr><th>Node</th><th>Degree</th></tr></thead><tbody>';
    sortedDegree.forEach(item => {
        html += `<tr>
            <td><strong>${item.id}</strong></td>
            <td><span style="color: #667eea; font-weight: bold;">${item.value}</span></td>
        </tr>`;
    });
    html += '</tbody></table></div></div>';
    
    html += '<div><h3>Betweenness Centrality:</h3>';
    html += '<div class="table-container"><table><thead><tr><th>Node</th><th>Betweenness</th></tr></thead><tbody>';
    sortedBetweenness.forEach(item => {
        html += `<tr>
            <td><strong>${item.id}</strong></td>
            <td><span style="color: #764ba2; font-weight: bold;">${item.value}</span></td>
        </tr>`;
    });
    html += '</tbody></table></div></div>';
    
    html += '</div>';
    resultDiv.innerHTML = html;
}

function visualizeNetwork() {
    const svg = d3.select('#network-visualization')
        .html('')
        .append('svg')
        .attr('width', 800)
        .attr('height', 600);
    
    const width = 800;
    const height = 600;
    
    const simulation = d3.forceSimulation(network.nodes)
        .force('link', d3.forceLink(network.links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2));
    
    const link = svg.append('g')
        .selectAll('line')
        .data(network.links)
        .enter().append('line')
        .attr('stroke', '#999')
        .attr('stroke-width', 2);
    
    const node = svg.append('g')
        .selectAll('circle')
        .data(network.nodes)
        .enter().append('circle')
        .attr('r', 25)
        .attr('fill', '#667eea')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));
    
    const label = svg.append('g')
        .selectAll('text')
        .data(network.nodes)
        .enter().append('text')
        .text(d => d.name)
        .attr('font-size', 12)
        .attr('dx', 30)
        .attr('dy', 5)
        .attr('fill', '#333')
        .attr('font-weight', 'bold');
    
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        
        label
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    });
    
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

// Initialize
visualizeNetwork();

