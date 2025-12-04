// Generate realistic traffic data based on actual network patterns
function generateTrafficData(hours = 24) {
    const data = [];
    const baseTraffic = 100;
    const now = new Date();
    
    for (let i = 0; i < hours; i++) {
        const hour = (now.getHours() + i) % 24;
        const dayOfWeek = (now.getDay() + Math.floor(i / 24)) % 7;
        
        // Realistic patterns based on actual network traffic studies
        let multiplier = 1;
        
        // Time-based patterns
        if (hour >= 9 && hour <= 11) {
            multiplier = 7.5; // Morning peak (business hours)
        } else if (hour >= 14 && hour <= 16) {
            multiplier = 6.0; // Afternoon peak
        } else if (hour >= 19 && hour <= 21) {
            multiplier = 5.5; // Evening peak (streaming, social media)
        } else if (hour >= 2 && hour <= 5) {
            multiplier = 0.4; // Night low
        } else if (hour >= 6 && hour <= 8) {
            multiplier = 2.0; // Morning rise
        } else {
            multiplier = 3.0; // Normal hours
        }
        
        // Day-of-week patterns (weekends typically lower)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            multiplier *= 0.7; // Weekend reduction
        }
        
        // Add realistic noise (Gaussian distribution)
        const noise = (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 15;
        const traffic = baseTraffic * multiplier + noise;
        
        data.push({
            hour: i,
            time: `${String(hour).padStart(2, '0')}:00`,
            traffic: Math.max(10, Math.round(traffic)),
            timestamp: new Date(now.getTime() + i * 60 * 60 * 1000)
        });
    }
    
    return data;
}

// ARIMA Prediction - Implementation thực tế hơn
function arimaPredict(data, steps = 6) {
    const predictions = [];
    const n = data.length;
    
    if (n < 2) return predictions;
    
    // Calculate first difference (d=1)
    const diffSeries = [];
    for (let i = 1; i < n; i++) {
        diffSeries.push(data[i].traffic - data[i - 1].traffic);
    }
    
    // Estimate AR(1) coefficient using least squares
    let sumXY = 0, sumX2 = 0;
    for (let i = 1; i < diffSeries.length; i++) {
        sumXY += diffSeries[i] * diffSeries[i - 1];
        sumX2 += diffSeries[i - 1] * diffSeries[i - 1];
    }
    const phi1 = sumX2 > 0 ? sumXY / sumX2 : 0.5; // AR coefficient
    const phi1_clamped = Math.max(-0.9, Math.min(0.9, phi1)); // Clamp to stable range
    
    // Estimate MA(1) coefficient (simplified)
    const theta1 = 0.3; // Typical value
    
    // Calculate mean of differenced series
    const meanDiff = diffSeries.reduce((a, b) => a + b, 0) / diffSeries.length;
    
    // Predict using ARIMA(1,1,1) formula
    let lastDiff = diffSeries[diffSeries.length - 1];
    let lastError = 0;
    
    for (let i = 0; i < steps; i++) {
        // ARIMA(1,1,1): (1-φB)(1-B)y_t = (1+θB)ε_t
        // Simplified: Δy_t = φ*Δy_{t-1} + ε_t + θ*ε_{t-1}
        const error = (Math.random() - 0.5) * Math.sqrt(Math.abs(meanDiff)) * 0.5;
        const predictedDiff = phi1_clamped * lastDiff + error + theta1 * lastError;
        
        const predictedValue = data[n - 1].traffic + predictedDiff;
        
        predictions.push({
            hour: n + i,
            time: `${String((data[n - 1].hour + i + 1) % 24).padStart(2, '0')}:00`,
            traffic: Math.max(10, Math.round(predictedValue))
        });
        
        lastDiff = predictedDiff;
        lastError = error;
    }
    
    return predictions;
}

// LSTM Prediction - Mô phỏng LSTM thực tế hơn
function lstmPredict(data, steps = 6) {
    const predictions = [];
    const n = data.length;
    const window = 12; // Look back 12 hours for better context
    
    if (n < window) {
        // Not enough data, use simple average
        const avg = data.reduce((sum, d) => sum + d.traffic, 0) / n;
        for (let i = 0; i < steps; i++) {
            predictions.push({
                hour: n + i,
                time: `${String((data[n - 1].hour + i + 1) % 24).padStart(2, '0')}:00`,
                traffic: Math.round(avg)
            });
        }
        return predictions;
    }
    
    // Extract features from recent window
    const recentData = data.slice(n - window);
    const values = recentData.map(d => d.traffic);
    
    // Calculate features: mean, trend, volatility
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const trend = (values[values.length - 1] - values[0]) / values.length;
    const volatility = Math.sqrt(
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );
    
    // LSTM-like hidden state with forget gate, input gate, output gate
    let hiddenState = mean;
    let cellState = trend;
    
    // LSTM parameters (simulated)
    const forgetGate = 0.7; // How much to forget
    const inputGate = 0.3; // How much new info to accept
    const outputGate = 0.8; // How much to output
    
    for (let i = 0; i < steps; i++) {
        // Simulate LSTM gates
        const currentInput = data[n - 1].traffic;
        const timeOfDay = (data[n - 1].hour + i + 1) % 24;
        
        // Time-based adjustment (captures daily patterns)
        let timeAdjustment = 1;
        if (timeOfDay >= 9 && timeOfDay <= 11) timeAdjustment = 1.5;
        else if (timeOfDay >= 2 && timeOfDay <= 5) timeAdjustment = 0.3;
        else if (timeOfDay >= 14 && timeOfDay <= 16) timeAdjustment = 1.3;
        
        // Update cell state (long-term memory)
        cellState = forgetGate * cellState + inputGate * (currentInput - mean);
        
        // Update hidden state (short-term memory)
        hiddenState = outputGate * (hiddenState + cellState * 0.1) + (1 - outputGate) * currentInput;
        
        // Apply time adjustment and add controlled noise
        const predicted = hiddenState * timeAdjustment + (Math.random() - 0.5) * volatility * 0.3;
        
        predictions.push({
            hour: n + i,
            time: `${String(timeOfDay).padStart(2, '0')}:00`,
            traffic: Math.max(10, Math.round(predicted))
        });
        
        // Update for next iteration
        hiddenState = predicted;
    }
    
    return predictions;
}

function predictTraffic() {
    const model = document.getElementById('model-select').value;
    const historicalData = generateTrafficData(24);
    
    let predictions;
    let modelName;
    
    if (model === 'arima') {
        predictions = arimaPredict(historicalData, 6);
        modelName = 'ARIMA';
    } else {
        predictions = lstmPredict(historicalData, 6);
        modelName = 'LSTM';
    }
    
    displayTrafficPrediction(historicalData, predictions, modelName);
}

function displayTrafficPrediction(historical, predictions, modelName) {
    const resultDiv = document.getElementById('traffic-result');
    resultDiv.style.display = 'block';
    
    const allData = [...historical, ...predictions];
    
    let html = `<h3><i class="fas fa-chart-line"></i> Dự báo Traffic (${modelName}):</h3>`;
    
    // Statistics
    const avgHistorical = historical.reduce((sum, d) => sum + d.traffic, 0) / historical.length;
    const avgPredicted = predictions.reduce((sum, d) => sum + d.traffic, 0) / predictions.length;
    
    html += '<div class="grid-2" style="margin-bottom: 20px;">';
    html += `<div class="result-item">
        <h4>Traffic trung bình (lịch sử)</h4>
        <p style="font-size: 1.5em; color: #667eea; font-weight: bold;">${Math.round(avgHistorical)} Mbps</p>
    </div>`;
    html += `<div class="result-item">
        <h4>Traffic trung bình (dự báo)</h4>
        <p style="font-size: 1.5em; color: #764ba2; font-weight: bold;">${Math.round(avgPredicted)} Mbps</p>
    </div>`;
    html += '</div>';
    
    // Chart
    html += '<h4>Biểu đồ Traffic:</h4>';
    html += '<canvas id="traffic-chart" style="max-height: 400px;"></canvas>';
    
    // Table
    html += '<h4 style="margin-top: 30px;">Chi tiết dự báo:</h4>';
    html += '<div class="table-container"><table><thead><tr><th>Thời gian</th><th>Traffic (Mbps)</th><th>Trạng thái</th></tr></thead><tbody>';
    
    predictions.forEach(pred => {
        const status = pred.traffic > avgHistorical * 1.5 ? 'Cao' : pred.traffic < avgHistorical * 0.5 ? 'Thấp' : 'Bình thường';
        const color = pred.traffic > avgHistorical * 1.5 ? '#f44336' : pred.traffic < avgHistorical * 0.5 ? '#4caf50' : '#ff9800';
        html += `<tr>
            <td><strong>${pred.time}</strong></td>
            <td><span style="font-weight: bold; font-size: 1.1em;">${pred.traffic}</span> Mbps</td>
            <td><span style="color: ${color}; font-weight: bold;">${status}</span></td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    
    resultDiv.innerHTML = html;
    
    // Draw chart
    const ctx = document.getElementById('traffic-chart').getContext('2d');
    const labels = allData.map(d => d.time);
    const historicalData = historical.map(d => d.traffic);
    const predictedData = predictions.map(d => d.traffic);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Lịch sử',
                    data: [...historicalData, ...new Array(predictions.length).fill(null)],
                    borderColor: '#667eea',
                    backgroundColor: '#667eea20',
                    tension: 0.4
                },
                {
                    label: 'Dự báo',
                    data: [...new Array(historical.length).fill(null), ...predictedData],
                    borderColor: '#764ba2',
                    backgroundColor: '#764ba220',
                    borderDash: [5, 5],
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Anomaly Detection
function detectAnomalies() {
    const trafficData = generateTrafficData(48);
    
    // Inject some anomalies
    trafficData[15].traffic = 900; // Spike
    trafficData[30].traffic = 20; // Drop
    trafficData[42].traffic = 850; // Another spike
    
    // Calculate statistics
    const values = trafficData.map(d => d.traffic);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Detect anomalies using z-score
    const anomalies = trafficData.map((d, index) => {
        const zScore = Math.abs((d.traffic - mean) / stdDev);
        return {
            ...d,
            index,
            zScore,
            isAnomaly: zScore > 3 // 3-sigma rule
        };
    }).filter(a => a.isAnomaly);
    
    displayAnomalies(trafficData, anomalies, mean, stdDev);
}

function displayAnomalies(data, anomalies, mean, stdDev) {
    const resultDiv = document.getElementById('anomaly-result');
    resultDiv.style.display = 'block';
    
    let html = `<h3><i class="fas fa-exclamation-triangle"></i> Phát hiện Anomaly:</h3>`;
    
    html += `<div class="grid-2" style="margin-bottom: 20px;">
        <div class="result-item">
            <h4>Thống kê</h4>
            <p>Trung bình: <strong>${Math.round(mean)}</strong> Mbps</p>
            <p>Độ lệch chuẩn: <strong>${Math.round(stdDev)}</strong> Mbps</p>
        </div>
        <div class="result-item">
            <h4>Anomalies phát hiện</h4>
            <p style="font-size: 2em; color: #f44336; font-weight: bold;">${anomalies.length}</p>
        </div>
    </div>`;
    
    if (anomalies.length > 0) {
        html += '<h4>Chi tiết Anomalies:</h4>';
        html += '<div class="table-container"><table><thead><tr><th>Thời gian</th><th>Traffic</th><th>Z-Score</th><th>Loại</th></tr></thead><tbody>';
        
        anomalies.forEach(anomaly => {
            const type = anomaly.traffic > mean ? 'Spike' : 'Drop';
            const color = type === 'Spike' ? '#f44336' : '#ff9800';
            html += `<tr>
                <td><strong>${anomaly.time}</strong></td>
                <td><span style="color: ${color}; font-weight: bold; font-size: 1.1em;">${anomaly.traffic}</span> Mbps</td>
                <td><span style="font-weight: bold;">${anomaly.zScore.toFixed(2)}</span></td>
                <td><span style="color: ${color}; font-weight: bold;">${type}</span></td>
            </tr>`;
        });
        
        html += '</tbody></table></div>';
    }
    
    // Chart
    html += '<h4 style="margin-top: 30px;">Biểu đồ Traffic với Anomalies:</h4>';
    html += '<canvas id="anomaly-chart" style="max-height: 400px;"></canvas>';
    
    resultDiv.innerHTML = html;
    
    // Draw chart
    const ctx = document.getElementById('anomaly-chart').getContext('2d');
    const labels = data.map(d => d.time);
    const trafficValues = data.map(d => d.traffic);
    const anomalyIndices = anomalies.map(a => a.index);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Traffic',
                    data: trafficValues,
                    borderColor: '#667eea',
                    backgroundColor: '#667eea20',
                    tension: 0.4,
                    pointRadius: (ctx) => {
                        return anomalyIndices.includes(ctx.dataIndex) ? 8 : 3;
                    },
                    pointBackgroundColor: (ctx) => {
                        return anomalyIndices.includes(ctx.dataIndex) ? '#f44336' : '#667eea';
                    }
                },
                {
                    label: 'Mean',
                    data: new Array(data.length).fill(mean),
                    borderColor: '#4caf50',
                    borderDash: [5, 5],
                    pointRadius: 0
                },
                {
                    label: 'Mean ± 3σ',
                    data: new Array(data.length).fill(mean + 3 * stdDev),
                    borderColor: '#ff9800',
                    borderDash: [3, 3],
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

