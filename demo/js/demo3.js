// Graph data - Based on real web structures
const graphs = {
    simple: {
        nodes: [
            {id: 'A', name: 'Homepage'},
            {id: 'B', name: 'Products'},
            {id: 'C', name: 'About'}
        ],
        links: [
            {source: 'A', target: 'B', weight: 0.8},
            {source: 'B', target: 'C', weight: 0.3},
            {source: 'C', target: 'A', weight: 0.5},
            {source: 'A', target: 'C', weight: 0.2}
        ]
    },
    medium: {
        nodes: [
            {id: 'A', name: 'Homepage'},
            {id: 'B', name: 'Products'},
            {id: 'C', name: 'Services'},
            {id: 'D', name: 'Blog'},
            {id: 'E', name: 'Contact'}
        ],
        links: [
            {source: 'A', target: 'B', weight: 0.9},
            {source: 'A', target: 'C', weight: 0.7},
            {source: 'B', target: 'C', weight: 0.4},
            {source: 'B', target: 'D', weight: 0.3},
            {source: 'C', target: 'D', weight: 0.5},
            {source: 'C', target: 'E', weight: 0.6},
            {source: 'D', target: 'E', weight: 0.4},
            {source: 'E', target: 'A', weight: 0.8}
        ]
    },
    complex: {
        nodes: [
            {id: 'A', name: 'Page A'},
            {id: 'B', name: 'Page B'},
            {id: 'C', name: 'Page C'},
            {id: 'D', name: 'Page D'},
            {id: 'E', name: 'Page E'},
            {id: 'F', name: 'Page F'},
            {id: 'G', name: 'Page G'}
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
            {source: 'E', target: 'F'},
            {source: 'E', target: 'G'},
            {source: 'F', target: 'G'},
            {source: 'G', target: 'A'}
        ]
    }
};

let currentGraph = graphs.simple;

function loadGraph() {
    const select = document.getElementById('graph-select');
    currentGraph = graphs[select.value];
    visualizeGraph();
}

// PageRank Calculation - Thuật toán thực tế
function calculatePageRank() {
    const dampingFactor = 0.85; // Standard Google damping factor
    const iterations = 20; // More iterations for convergence
    const numPages = currentGraph.nodes.length;
    const tolerance = 0.0001; // Convergence threshold
    
    // Initialize PageRank values uniformly
    let pr = {};
    currentGraph.nodes.forEach(node => {
        pr[node.id] = 1.0 / numPages;
    });

    // Build adjacency matrix with link weights
    const outLinks = {};
    const inLinks = {};
    const linkWeights = {};
    
    currentGraph.nodes.forEach(node => {
        outLinks[node.id] = [];
        inLinks[node.id] = [];
    });

    currentGraph.links.forEach(link => {
        outLinks[link.source].push(link.target);
        inLinks[link.target].push(link.source);
        const key = `${link.source}-${link.target}`;
        linkWeights[key] = link.weight || 1.0; // Default weight 1.0
    });

    // Calculate total out-link weights for each node
    const outLinkWeights = {};
    currentGraph.nodes.forEach(node => {
        let totalWeight = 0;
        outLinks[node.id].forEach(target => {
            const key = `${node.id}-${target}`;
            totalWeight += linkWeights[key] || 1.0;
        });
        outLinkWeights[node.id] = totalWeight || 1.0; // Avoid division by zero
    });

    // Calculate PageRank iteratively with convergence check
    const results = [JSON.parse(JSON.stringify(pr))];
    let converged = false;
    
    for (let iter = 0; iter < iterations && !converged; iter++) {
        const newPR = {};
        let maxDiff = 0;
        
        currentGraph.nodes.forEach(node => {
            let sum = 0;
            inLinks[node.id].forEach(incoming => {
                const key = `${incoming}-${node.id}`;
                const weight = linkWeights[key] || 1.0;
                const outWeight = outLinkWeights[incoming];
                sum += (pr[incoming] * weight) / outWeight;
            });
            newPR[node.id] = (1 - dampingFactor) / numPages + dampingFactor * sum;
            
            // Check convergence
            const diff = Math.abs(newPR[node.id] - pr[node.id]);
            if (diff > maxDiff) maxDiff = diff;
        });
        
        // Normalize to ensure sum = 1
        const total = Object.values(newPR).reduce((a, b) => a + b, 0);
        currentGraph.nodes.forEach(node => {
            newPR[node.id] /= total;
        });
        
        pr = newPR;
        results.push(JSON.parse(JSON.stringify(pr)));
        
        // Check if converged
        if (maxDiff < tolerance) {
            converged = true;
            console.log(`PageRank converged after ${iter + 1} iterations`);
        }
    }

    displayPageRankResults(pr, results, converged);
    visualizeGraphWithPageRank(pr);
}

function displayPageRankResults(finalPR, iterations, converged) {
    const resultDiv = document.getElementById('pagerank-result');
    resultDiv.style.display = 'block';

    // Sort by PageRank
    const sorted = Object.entries(finalPR)
        .sort((a, b) => b[1] - a[1])
        .map(([id, value]) => {
            const node = currentGraph.nodes.find(n => n.id === id);
            return {id, name: node ? node.name : id, value};
        });

    let html = `<h3><i class="fas fa-trophy"></i> Kết quả PageRank (sau ${iterations.length} iterations):</h3>`;
    if (converged) {
        html += '<div class="alert alert-success" style="margin-bottom: 15px;"><i class="fas fa-check-circle"></i> Đã hội tụ!</div>';
    }
    html += '<div class="table-container"><table><thead><tr><th>Xếp hạng</th><th>Trang</th><th>Tên</th><th>PageRank</th><th>Phần trăm</th></tr></thead><tbody>';

    sorted.forEach((item, index) => {
        const percentage = (item.value * 100).toFixed(2);
        const rankColor = index === 0 ? '#4caf50' : index === 1 ? '#ff9800' : '#667eea';
        html += `<tr>
            <td><strong style="color: ${rankColor};">#${index + 1}</strong></td>
            <td><strong>${item.id}</strong></td>
            <td>${item.name}</td>
            <td>${item.value.toFixed(6)}</td>
            <td><span style="color: #667eea; font-weight: bold; font-size: 1.1em;">${percentage}%</span></td>
        </tr>`;
    });

    html += '</tbody></table></div>';

    // Show iteration chart
    html += '<h4 style="margin-top: 30px;">Quá trình hội tụ:</h4>';
    html += '<canvas id="pagerank-chart" style="max-height: 300px;"></canvas>';

    resultDiv.innerHTML = html;

    // Draw chart
    const ctx = document.getElementById('pagerank-chart').getContext('2d');
    const labels = iterations.map((_, i) => `Iteration ${i}`);
    const datasets = currentGraph.nodes.map((node, idx) => {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#30cfd0'];
        return {
            label: `Page ${node.id}`,
            data: iterations.map(iter => iter[node.id]),
            borderColor: colors[idx % colors.length],
            backgroundColor: colors[idx % colors.length] + '20',
            tension: 0.4
        };
    });

    new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// HITS Algorithm
function calculateHITS() {
    const iterations = 10;
    
    // Initialize Hub and Authority scores
    let hubs = {};
    let authorities = {};
    currentGraph.nodes.forEach(node => {
        hubs[node.id] = 1.0;
        authorities[node.id] = 1.0;
    });

    // Build link structure
    const outLinks = {};
    const inLinks = {};
    currentGraph.nodes.forEach(node => {
        outLinks[node.id] = [];
        inLinks[node.id] = [];
    });

    currentGraph.links.forEach(link => {
        outLinks[link.source].push(link.target);
        inLinks[link.target].push(link.source);
    });

    // Iterate
    for (let iter = 0; iter < iterations; iter++) {
        // Update authorities
        let authSum = 0;
        const newAuthorities = {};
        currentGraph.nodes.forEach(node => {
            let sum = 0;
            inLinks[node.id].forEach(incoming => {
                sum += hubs[incoming];
            });
            newAuthorities[node.id] = sum;
            authSum += sum * sum;
        });
        authSum = Math.sqrt(authSum);
        currentGraph.nodes.forEach(node => {
            authorities[node.id] = newAuthorities[node.id] / authSum;
        });

        // Update hubs
        let hubSum = 0;
        const newHubs = {};
        currentGraph.nodes.forEach(node => {
            let sum = 0;
            outLinks[node.id].forEach(outgoing => {
                sum += authorities[outgoing];
            });
            newHubs[node.id] = sum;
            hubSum += sum * sum;
        });
        hubSum = Math.sqrt(hubSum);
        currentGraph.nodes.forEach(node => {
            hubs[node.id] = newHubs[node.id] / hubSum;
        });
    }

    displayHITSResults(hubs, authorities);
}

function displayHITSResults(hubs, authorities) {
    const resultDiv = document.getElementById('hits-result');
    resultDiv.style.display = 'block';

    const sortedHubs = Object.entries(hubs)
        .sort((a, b) => b[1] - a[1])
        .map(([id, value]) => ({id, value}));

    const sortedAuths = Object.entries(authorities)
        .sort((a, b) => b[1] - a[1])
        .map(([id, value]) => ({id, value}));

    let html = '<div class="grid-2">';
    
    html += '<div><h3><i class="fas fa-star"></i> Top Hubs:</h3>';
    html += '<div class="table-container"><table><thead><tr><th>Xếp hạng</th><th>Trang</th><th>Hub Score</th></tr></thead><tbody>';
    sortedHubs.forEach((item, index) => {
        html += `<tr>
            <td><strong>#${index + 1}</strong></td>
            <td><strong>${item.id}</strong></td>
            <td><span style="color: #667eea; font-weight: bold;">${item.value.toFixed(4)}</span></td>
        </tr>`;
    });
    html += '</tbody></table></div></div>';

    html += '<div><h3><i class="fas fa-certificate"></i> Top Authorities:</h3>';
    html += '<div class="table-container"><table><thead><tr><th>Xếp hạng</th><th>Trang</th><th>Authority Score</th></tr></thead><tbody>';
    sortedAuths.forEach((item, index) => {
        html += `<tr>
            <td><strong>#${index + 1}</strong></td>
            <td><strong>${item.id}</strong></td>
            <td><span style="color: #764ba2; font-weight: bold;">${item.value.toFixed(4)}</span></td>
        </tr>`;
    });
    html += '</tbody></table></div></div>';

    html += '</div>';
    resultDiv.innerHTML = html;
}

// Graph Visualization
function visualizeGraph() {
    const svg = d3.select('#graph-visualization')
        .html('')
        .append('svg')
        .attr('width', 800)
        .attr('height', 600);

    const width = 800;
    const height = 600;

    const simulation = d3.forceSimulation(currentGraph.nodes)
        .force('link', d3.forceLink(currentGraph.links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
        .selectAll('line')
        .data(currentGraph.links)
        .enter().append('line')
        .attr('stroke', '#999')
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.6)
        .attr('marker-end', 'url(#arrowhead)');

    // Arrow marker
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 25)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10,0 L 0,5')
        .attr('fill', '#999');

    const node = svg.append('g')
        .selectAll('circle')
        .data(currentGraph.nodes)
        .enter().append('circle')
        .attr('r', 20)
        .attr('fill', '#667eea')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    const label = svg.append('g')
        .selectAll('text')
        .data(currentGraph.nodes)
        .enter().append('text')
        .text(d => d.id)
        .attr('font-size', 14)
        .attr('dx', 25)
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

function visualizeGraphWithPageRank(pr) {
    const svg = d3.select('#pagerank-visualization')
        .html('')
        .append('svg')
        .attr('width', 800)
        .attr('height', 600);

    const width = 800;
    const height = 600;

    const maxPR = Math.max(...Object.values(pr));
    const scale = d3.scaleLinear()
        .domain([0, maxPR])
        .range([15, 40]);

    const simulation = d3.forceSimulation(currentGraph.nodes)
        .force('link', d3.forceLink(currentGraph.links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
        .selectAll('line')
        .data(currentGraph.links)
        .enter().append('line')
        .attr('stroke', '#999')
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.6)
        .attr('marker-end', 'url(#arrowhead-pr)');

    svg.append('defs').append('marker')
        .attr('id', 'arrowhead-pr')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 25)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10,0 L 0,5')
        .attr('fill', '#999');

    const node = svg.append('g')
        .selectAll('circle')
        .data(currentGraph.nodes)
        .enter().append('circle')
        .attr('r', d => scale(pr[d.id]))
        .attr('fill', d => {
            const intensity = pr[d.id] / maxPR;
            return d3.interpolateYlOrRd(intensity);
        })
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    const label = svg.append('g')
        .selectAll('text')
        .data(currentGraph.nodes)
        .enter().append('text')
        .text(d => `${d.id} (${pr[d.id].toFixed(3)})`)
        .attr('font-size', 12)
        .attr('dx', d => scale(pr[d.id]) + 5)
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
loadGraph();
visualizeGraph();

