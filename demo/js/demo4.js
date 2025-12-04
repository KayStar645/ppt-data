// CTR Prediction
function predictCTR() {
    const title = document.getElementById('ad-title').value;
    const category = document.getElementById('ad-category').value;
    
    // Simulate CTR prediction based on features
    let ctr = 0.02; // Base CTR 2%
    
    // Title features
    if (title.toLowerCase().includes('giảm giá') || title.toLowerCase().includes('sale')) ctr += 0.015;
    if (title.toLowerCase().includes('miễn phí') || title.toLowerCase().includes('free')) ctr += 0.01;
    if (title.length > 20 && title.length < 50) ctr += 0.005;
    
    // Category features
    const categoryCTR = {
        'Thời trang': 0.025,
        'Điện tử': 0.03,
        'Thực phẩm': 0.02,
        'Du lịch': 0.015
    };
    if (categoryCTR[category]) ctr = categoryCTR[category];
    
    // Add some randomness
    ctr += (Math.random() - 0.5) * 0.01;
    ctr = Math.max(0.01, Math.min(0.1, ctr));
    
    displayCTRResult(ctr, title, category);
}

function displayCTRResult(ctr, title, category) {
    const resultDiv = document.getElementById('ctr-result');
    resultDiv.style.display = 'block';
    
    let html = `<h3><i class="fas fa-chart-line"></i> Kết quả dự đoán CTR:</h3>`;
    html += `<div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>Tiêu đề:</strong> ${title}</p>
        <p><strong>Danh mục:</strong> ${category}</p>
    </div>`;
    
    html += `<div style="text-align: center; padding: 30px;">
        <h2 style="color: #667eea; font-size: 3em; margin-bottom: 10px;">${(ctr * 100).toFixed(2)}%</h2>
        <p style="font-size: 1.2em; color: #666;">Click-Through Rate dự đoán</p>
    </div>`;
    
    // CTR bar
    html += '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">';
    html += '<p style="margin-bottom: 10px;"><strong>Biểu đồ CTR:</strong></p>';
    html += `<div style="background: white; height: 40px; border-radius: 20px; overflow: hidden; position: relative;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100%; width: ${ctr * 1000}%; transition: width 0.5s;"></div>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; color: #333;">
            ${(ctr * 100).toFixed(2)}%
        </div>
    </div>`;
    html += '</div>';
    
    resultDiv.innerHTML = html;
}

// GSP Auction
function runGSPAuction() {
    const bidders = [
        { name: 'Advertiser A', bid: 5.00, quality: 0.9 },
        { name: 'Advertiser B', bid: 4.50, quality: 0.85 },
        { name: 'Advertiser C', bid: 4.00, quality: 0.8 },
        { name: 'Advertiser D', bid: 3.50, quality: 0.75 }
    ];
    
    // Calculate quality scores
    bidders.forEach(bidder => {
        bidder.qualityScore = bidder.bid * bidder.quality;
    });
    
    // Sort by quality score
    bidders.sort((a, b) => b.qualityScore - a.qualityScore);
    
    // Assign positions and calculate payments (GSP: pay next bidder's bid)
    const positions = ['Vị trí 1', 'Vị trí 2', 'Vị trí 3', 'Vị trí 4'];
    bidders.forEach((bidder, index) => {
        bidder.position = positions[index];
        if (index < bidders.length - 1) {
            bidder.payment = bidders[index + 1].bid;
        } else {
            bidder.payment = 0; // Last position pays minimum
        }
    });
    
    displayGSPResult(bidders);
}

function displayGSPResult(bidders) {
    const resultDiv = document.getElementById('gsp-result');
    resultDiv.style.display = 'block';
    
    let html = `<h3><i class="fas fa-gavel"></i> Kết quả GSP Auction:</h3>`;
    html += '<div class="table-container"><table><thead><tr><th>Vị trí</th><th>Nhà quảng cáo</th><th>Bid</th><th>Quality</th><th>Quality Score</th><th>Thanh toán</th></tr></thead><tbody>';
    
    bidders.forEach(bidder => {
        html += `<tr>
            <td><strong>${bidder.position}</strong></td>
            <td>${bidder.name}</td>
            <td>$${bidder.bid.toFixed(2)}</td>
            <td>${(bidder.quality * 100).toFixed(0)}%</td>
            <td><span style="color: #667eea; font-weight: bold;">${bidder.qualityScore.toFixed(2)}</span></td>
            <td><span style="color: #4caf50; font-weight: bold;">$${bidder.payment.toFixed(2)}</span></td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    
    const totalRevenue = bidders.reduce((sum, b) => sum + b.payment, 0);
    html += `<div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <h4>Tổng doanh thu: <span style="color: #2e7d32; font-size: 1.5em;">$${totalRevenue.toFixed(2)}</span></h4>
    </div>`;
    
    resultDiv.innerHTML = html;
}

