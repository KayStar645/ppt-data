function calculateRisk() {
    const threat = parseInt(document.getElementById('threat').value);
    const vulnerability = parseInt(document.getElementById('vulnerability').value);
    const impact = parseInt(document.getElementById('impact').value);
    
    const riskScore = threat * vulnerability * impact;
    
    let riskLevel, riskColor;
    if (riskScore >= 500) {
        riskLevel = 'CRITICAL';
        riskColor = '#f44336';
    } else if (riskScore >= 200) {
        riskLevel = 'HIGH';
        riskColor = '#ff9800';
    } else {
        riskLevel = 'LOW';
        riskColor = '#4caf50';
    }
    
    displayRiskResult(riskScore, riskLevel, riskColor, threat, vulnerability, impact);
}

function displayRiskResult(score, level, color, threat, vulnerability, impact) {
    const resultDiv = document.getElementById('risk-result');
    resultDiv.style.display = 'block';
    
    let html = `<h3><i class="fas fa-exclamation-triangle"></i> Kết quả Risk Scoring:</h3>`;
    html += `<div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>Threat:</strong> ${threat}/10</p>
        <p><strong>Vulnerability:</strong> ${vulnerability}/10</p>
        <p><strong>Impact:</strong> ${impact}/10</p>
    </div>`;
    
    html += `<div style="text-align: center; padding: 30px;">
        <h2 style="color: ${color}; font-size: 3em; margin-bottom: 10px;">${score}</h2>
        <p style="font-size: 1.5em; color: ${color}; font-weight: bold;">${level}</p>
        <p style="margin-top: 10px; color: #666;">Risk Score = ${threat} × ${vulnerability} × ${impact}</p>
    </div>`;
    
    html += '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">';
    html += '<p style="margin-bottom: 10px;"><strong>Risk Level Bar:</strong></p>';
    html += `<div style="background: white; height: 40px; border-radius: 20px; overflow: hidden; position: relative;">
        <div style="background: ${color}; height: 100%; width: ${Math.min(100, (score / 10))}%; transition: width 0.5s;"></div>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; color: #333;">
            ${score} / 1000
        </div>
    </div>`;
    html += '</div>';
    
    resultDiv.innerHTML = html;
}

function detectPhishing() {
    const url = document.getElementById('url-input').value;
    
    // Phishing detection features
    let score = 0;
    const features = [];
    
    // Check HTTPS
    if (!url.startsWith('https://')) {
        score += 30;
        features.push({ name: 'Không có HTTPS', risk: 'HIGH' });
    }
    
    // Check suspicious domain
    if (url.includes('paypal-security') || url.includes('bank-security') || url.includes('verify-account')) {
        score += 40;
        features.push({ name: 'Domain đáng ngờ', risk: 'HIGH' });
    }
    
    // Check IP in URL
    if (/\d+\.\d+\.\d+\.\d+/.test(url)) {
        score += 20;
        features.push({ name: 'IP trong URL', risk: 'MEDIUM' });
    }
    
    // Check URL length
    if (url.length > 100) {
        score += 10;
        features.push({ name: 'URL quá dài', risk: 'LOW' });
    }
    
    // Check special characters
    if ((url.match(/[^a-zA-Z0-9.-]/g) || []).length > 5) {
        score += 15;
        features.push({ name: 'Nhiều ký tự đặc biệt', risk: 'MEDIUM' });
    }
    
    const isPhishing = score > 50;
    const confidence = Math.min(95, Math.max(5, score));
    
    displayPhishingResult(url, isPhishing, confidence, features, score);
}

function displayPhishingResult(url, isPhishing, confidence, features, score) {
    const resultDiv = document.getElementById('phishing-result');
    resultDiv.style.display = 'block';
    
    const color = isPhishing ? '#f44336' : '#4caf50';
    const icon = isPhishing ? '⚠️' : '✅';
    const result = isPhishing ? 'PHISHING' : 'SAFE';
    
    let html = `<h3><i class="fas fa-shield-alt"></i> Kết quả kiểm tra Phishing:</h3>`;
    html += `<div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>URL:</strong> ${url}</p>
    </div>`;
    
    html += `<div style="text-align: center; padding: 30px;">
        <div style="font-size: 5em; margin-bottom: 15px;">${icon}</div>
        <h2 style="color: ${color}; margin-bottom: 10px;">${result}</h2>
        <p style="font-size: 1.5em; color: ${color}; font-weight: bold;">${confidence.toFixed(1)}%</p>
    </div>`;
    
    if (features.length > 0) {
        html += '<h4>Các đặc điểm phát hiện:</h4>';
        html += '<div class="table-container"><table><thead><tr><th>Đặc điểm</th><th>Mức độ rủi ro</th></tr></thead><tbody>';
        features.forEach(feature => {
            const riskColor = feature.risk === 'HIGH' ? '#f44336' : feature.risk === 'MEDIUM' ? '#ff9800' : '#ffc107';
            html += `<tr>
                <td>${feature.name}</td>
                <td><span style="color: ${riskColor}; font-weight: bold;">${feature.risk}</span></td>
            </tr>`;
        });
        html += '</tbody></table></div>';
    }
    
    html += `<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p><strong>Phishing Score:</strong> ${score}/100</p>
    </div>`;
    
    resultDiv.innerHTML = html;
}

