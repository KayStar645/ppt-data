// Sentiment dictionaries - Mở rộng với từ điển thực tế
const positiveWords = [
    'tuyệt', 'tuyệt vời', 'xuất sắc', 'hài lòng', 'tốt', 'tuyệt đối', 'thích', 'yêu', 
    'hoàn hảo', 'tuyệt hảo', 'rất tốt', 'cực kỳ', 'tuyệt đỉnh', 'tuyệt vời', 'tốt đẹp',
    'hài lòng', 'thỏa mãn', 'ưng ý', 'thích thú', 'phấn khởi', 'vui mừng', 'hạnh phúc',
    'tuyệt vời', 'chất lượng', 'đáng giá', 'nên mua', 'khuyến nghị', '5 sao', 'tốt nhất'
];
const negativeWords = [
    'tệ', 'xấu', 'không tốt', 'thất vọng', 'tồi', 'kém', 'tệ hại', 'ghét', 
    'không thích', 'rất tệ', 'cực kỳ tệ', 'tệ nhất', 'tồi tệ', 'không đáng',
    'lãng phí', 'không hài lòng', 'bực mình', 'tức giận', 'buồn', 'chán',
    'không nên mua', 'tệ hại', 'kém chất lượng', 'lừa đảo', '1 sao'
];

// Sample datasets
const datasets = {
    reviews: [
        "Sản phẩm này thật tuyệt vời! Tôi rất hài lòng.",
        "Chất lượng kém, không đáng tiền.",
        "Tốt nhưng giá hơi cao.",
        "Tuyệt đối sẽ mua lại!",
        "Dịch vụ khách hàng rất tệ.",
        "Sản phẩm đẹp, giao hàng nhanh.",
        "Không như mong đợi, thất vọng.",
        "Rất hài lòng với chất lượng!"
    ],
    tweets: [
        "Hôm nay thời tiết thật đẹp!",
        "Phim này quá tệ, không đáng xem.",
        "Tuyệt vời! Tôi rất thích.",
        "Buồn quá, mọi thứ đều không ổn.",
        "Hạnh phúc khi được đi du lịch!",
        "Thất vọng với kết quả này."
    ],
    news: [
        "Kinh tế tăng trưởng tích cực trong quý này.",
        "Thị trường chứng khoán sụt giảm mạnh.",
        "Công ty công bố lợi nhuận kỷ lục.",
        "Tình hình an ninh đang được cải thiện."
    ]
};

let currentDataset = datasets.reviews;

function loadDataset() {
    const select = document.getElementById('dataset-select');
    currentDataset = datasets[select.value];
}

// Naive Bayes Sentiment Analysis - Thuật toán thực tế
function naiveBayesSentiment(text) {
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 1);
    
    let positiveCount = 0;
    let negativeCount = 0;
    let totalWords = words.length;

    // Tính tần suất từ tích cực/tiêu cực
    words.forEach(word => {
        const posMatch = positiveWords.filter(pw => word.includes(pw.toLowerCase()) || pw.toLowerCase().includes(word));
        const negMatch = negativeWords.filter(nw => word.includes(nw.toLowerCase()) || nw.toLowerCase().includes(word));
        
        if (posMatch.length > 0) {
            positiveCount += posMatch.length;
        }
        if (negMatch.length > 0) {
            negativeCount += negMatch.length;
        }
    });

    // Laplace smoothing để tránh zero probability
    const alpha = 1; // Smoothing parameter
    const vocabSize = positiveWords.length + negativeWords.length;
    
    const positiveProb = (positiveCount + alpha) / (totalWords + alpha * vocabSize);
    const negativeProb = (negativeCount + alpha) / (totalWords + alpha * vocabSize);
    
    // Normalize
    const totalProb = positiveProb + negativeProb;
    const normalizedPositive = totalProb > 0 ? positiveProb / totalProb : 0.5;
    const normalizedNegative = totalProb > 0 ? negativeProb / totalProb : 0.5;

    let sentiment, confidence;
    const diff = Math.abs(normalizedPositive - normalizedNegative);
    
    if (diff < 0.1) {
        sentiment = 'NEUTRAL';
        confidence = 0.5;
    } else if (normalizedPositive > normalizedNegative) {
        sentiment = 'POSITIVE';
        confidence = Math.min(0.95, 0.5 + diff);
    } else {
        sentiment = 'NEGATIVE';
        confidence = Math.min(0.95, 0.5 + diff);
    }

    return { 
        sentiment, 
        confidence, 
        positive: normalizedPositive, 
        negative: normalizedNegative,
        positiveCount,
        negativeCount
    };
}

// SVM Sentiment Analysis (simplified)
function svmSentiment(text) {
    // Simulate SVM with feature extraction
    const features = extractFeatures(text);
    const weights = { positive: 0.6, negative: -0.5, neutral: 0.1 };
    
    let score = 0;
    features.forEach(f => {
        if (f.type === 'positive') score += weights.positive * f.value;
        if (f.type === 'negative') score += weights.negative * f.value;
    });

    let sentiment, confidence;
    if (score > 0.3) {
        sentiment = 'POSITIVE';
        confidence = Math.min(0.5 + score, 0.95);
    } else if (score < -0.3) {
        sentiment = 'NEGATIVE';
        confidence = Math.min(0.5 - score, 0.95);
    } else {
        sentiment = 'NEUTRAL';
        confidence = 0.5;
    }

    return { sentiment, confidence, score };
}

function extractFeatures(text) {
    const words = text.toLowerCase().split(/\s+/);
    const features = [];
    
    words.forEach(word => {
        if (positiveWords.some(pw => word.includes(pw))) {
            features.push({ type: 'positive', value: 1 });
        }
        if (negativeWords.some(nw => word.includes(nw))) {
            features.push({ type: 'negative', value: 1 });
        }
    });

    return features;
}

// LSTM Sentiment Analysis (simplified simulation)
function lstmSentiment(text) {
    // Simulate LSTM with sequence analysis
    const words = text.toLowerCase().split(/\s+/);
    let hiddenState = 0.5;
    
    words.forEach(word => {
        let input = 0;
        if (positiveWords.some(pw => word.includes(pw))) input = 0.7;
        else if (negativeWords.some(nw => word.includes(nw))) input = 0.3;
        else input = 0.5;
        
        // Simple LSTM-like update
        hiddenState = 0.7 * hiddenState + 0.3 * input;
    });

    let sentiment, confidence;
    if (hiddenState > 0.6) {
        sentiment = 'POSITIVE';
        confidence = hiddenState;
    } else if (hiddenState < 0.4) {
        sentiment = 'NEGATIVE';
        confidence = 1 - hiddenState;
    } else {
        sentiment = 'NEUTRAL';
        confidence = 0.5;
    }

    return { sentiment, confidence, hiddenState };
}

// BERT Sentiment Analysis (simplified simulation)
function bertSentiment(text) {
    // Simulate BERT with context understanding
    const contextScore = analyzeContext(text);
    
    let sentiment, confidence;
    if (contextScore > 0.6) {
        sentiment = 'POSITIVE';
        confidence = Math.min(contextScore * 1.2, 0.98);
    } else if (contextScore < 0.4) {
        sentiment = 'NEGATIVE';
        confidence = Math.min((1 - contextScore) * 1.2, 0.98);
    } else {
        sentiment = 'NEUTRAL';
        confidence = 0.5;
    }

    return { sentiment, confidence, contextScore };
}

function analyzeContext(text) {
    const words = text.toLowerCase().split(/\s+/);
    let score = 0.5;
    let count = 0;

    words.forEach((word, index) => {
        if (positiveWords.some(pw => word.includes(pw))) {
            // Check context (exclamation marks, intensifiers)
            const context = index > 0 ? words[index - 1] : '';
            const multiplier = (context.includes('rất') || context.includes('cực') || text.includes('!')) ? 1.5 : 1.0;
            score += 0.15 * multiplier;
            count++;
        }
        if (negativeWords.some(nw => word.includes(nw))) {
            const context = index > 0 ? words[index - 1] : '';
            const multiplier = (context.includes('rất') || context.includes('cực')) ? 1.5 : 1.0;
            score -= 0.15 * multiplier;
            count++;
        }
    });

    if (count > 0) score = score / (count + 1);
    return Math.max(0, Math.min(1, score));
}

// Main analysis function
function analyzeSentiment() {
    const text = document.getElementById('sentiment-text').value;
    if (!text.trim()) {
        alert('Vui lòng nhập văn bản!');
        return;
    }

    const method = document.getElementById('method-select').value;
    const resultDiv = document.getElementById('sentiment-result');
    resultDiv.style.display = 'block';

    let results = {};
    
    if (method === 'all') {
        results.naiveBayes = naiveBayesSentiment(text);
        results.svm = svmSentiment(text);
        results.lstm = lstmSentiment(text);
        results.bert = bertSentiment(text);
        displayComparisonResults(results, text);
    } else {
        switch(method) {
            case 'naive-bayes':
                results = naiveBayesSentiment(text);
                break;
            case 'svm':
                results = svmSentiment(text);
                break;
            case 'lstm':
                results = lstmSentiment(text);
                break;
            case 'bert':
                results = bertSentiment(text);
                break;
        }
        displaySingleResult(results, method, text);
    }
}

function displaySingleResult(result, method, text) {
    const methodNames = {
        'naive-bayes': 'Naive Bayes',
        'svm': 'Support Vector Machine',
        'lstm': 'LSTM',
        'bert': 'BERT'
    };

    const sentimentLabels = {
        'POSITIVE': 'Tích cực',
        'NEGATIVE': 'Tiêu cực',
        'NEUTRAL': 'Trung tính'
    };

    const sentimentColors = {
        'POSITIVE': '#4caf50',
        'NEGATIVE': '#f44336',
        'NEUTRAL': '#ff9800'
    };

    let html = `<h3><i class="fas fa-check-circle"></i> Kết quả phân tích (${methodNames[method]}):</h3>`;
    html += `<div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="font-style: italic; color: #666; margin-bottom: 15px;">"${text}"</p>
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 3em; margin-bottom: 10px;">
                ${result.sentiment === 'POSITIVE' ? '😊' : result.sentiment === 'NEGATIVE' ? '😞' : '😐'}
            </div>
            <h2 style="color: ${sentimentColors[result.sentiment]}; margin-bottom: 10px;">
                ${sentimentLabels[result.sentiment]}
            </h2>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <p><strong>Độ tin cậy:</strong> <span style="color: ${sentimentColors[result.sentiment]}; font-weight: bold; font-size: 1.2em;">${(result.confidence * 100).toFixed(1)}%</span></p>
            </div>
        </div>
    </div>`;

    // Confidence bar
    html += '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">';
    html += '<p style="margin-bottom: 10px;"><strong>Biểu đồ độ tin cậy:</strong></p>';
    html += `<div style="background: white; height: 30px; border-radius: 15px; overflow: hidden; position: relative;">
        <div style="background: ${sentimentColors[result.sentiment]}; height: 100%; width: ${result.confidence * 100}%; transition: width 0.5s;"></div>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; color: #333;">
            ${(result.confidence * 100).toFixed(1)}%
        </div>
    </div>`;
    html += '</div>';

    resultDiv.innerHTML = html;
}

function displayComparisonResults(results, text) {
    let html = `<h3><i class="fas fa-chart-bar"></i> So sánh các phương pháp:</h3>`;
    html += `<div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p style="font-style: italic; color: #666;">"${text}"</p>
    </div>`;

    html += '<div class="table-container"><table><thead><tr><th>Phương pháp</th><th>Kết quả</th><th>Độ tin cậy</th><th>Chi tiết</th></tr></thead><tbody>';

    const methodNames = {
        'naiveBayes': 'Naive Bayes',
        'svm': 'SVM',
        'lstm': 'LSTM',
        'bert': 'BERT'
    };

    const sentimentLabels = {
        'POSITIVE': 'Tích cực',
        'NEGATIVE': 'Tiêu cực',
        'NEUTRAL': 'Trung tính'
    };

    const sentimentColors = {
        'POSITIVE': '#4caf50',
        'NEGATIVE': '#f44336',
        'NEUTRAL': '#ff9800'
    };

    Object.entries(results).forEach(([method, result]) => {
        html += `<tr>
            <td><strong>${methodNames[method]}</strong></td>
            <td><span style="color: ${sentimentColors[result.sentiment]}; font-weight: bold;">${sentimentLabels[result.sentiment]}</span></td>
            <td><span style="font-weight: bold;">${(result.confidence * 100).toFixed(1)}%</span></td>
            <td style="font-size: 0.9em; color: #666;">${JSON.stringify(result).substring(0, 50)}...</td>
        </tr>`;
    });

    html += '</tbody></table></div>';

    // Chart
    html += '<h4 style="margin-top: 30px;">Biểu đồ so sánh:</h4>';
    html += '<canvas id="comparison-chart" style="max-height: 300px;"></canvas>';

    document.getElementById('sentiment-result').innerHTML = html;

    // Draw comparison chart
    const ctx = document.getElementById('comparison-chart').getContext('2d');
    const labels = Object.keys(results).map(k => methodNames[k]);
    const data = Object.values(results).map(r => r.confidence * 100);
    const colors = Object.values(results).map(r => sentimentColors[r.sentiment]);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Độ tin cậy (%)',
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Batch Analysis
function batchAnalyze() {
    const resultDiv = document.getElementById('batch-result');
    resultDiv.style.display = 'block';

    const results = currentDataset.map(text => ({
        text: text,
        naiveBayes: naiveBayesSentiment(text),
        svm: svmSentiment(text),
        lstm: lstmSentiment(text),
        bert: bertSentiment(text)
    }));

    displayBatchResults(results);
}

function displayBatchResults(results) {
    let html = '<h3><i class="fas fa-chart-pie"></i> Kết quả phân tích hàng loạt:</h3>';

    // Statistics
    const stats = {
        naiveBayes: { positive: 0, negative: 0, neutral: 0 },
        svm: { positive: 0, negative: 0, neutral: 0 },
        lstm: { positive: 0, negative: 0, neutral: 0 },
        bert: { positive: 0, negative: 0, neutral: 0 }
    };

    results.forEach(r => {
        Object.keys(stats).forEach(method => {
            stats[method][r[method].sentiment.toLowerCase()]++;
        });
    });

    html += '<div class="grid-2" style="margin-bottom: 30px;">';
    Object.entries(stats).forEach(([method, stat]) => {
        const methodNames = {
            'naiveBayes': 'Naive Bayes',
            'svm': 'SVM',
            'lstm': 'LSTM',
            'bert': 'BERT'
        };
        html += `<div class="result-item">
            <h4>${methodNames[method]}</h4>
            <p>Tích cực: <strong style="color: #4caf50;">${stat.positive}</strong></p>
            <p>Tiêu cực: <strong style="color: #f44336;">${stat.negative}</strong></p>
            <p>Trung tính: <strong style="color: #ff9800;">${stat.neutral}</strong></p>
        </div>`;
    });
    html += '</div>';

    // Detailed results table
    html += '<h4>Chi tiết từng văn bản:</h4>';
    html += '<div class="table-container"><table><thead><tr><th>Văn bản</th><th>Naive Bayes</th><th>SVM</th><th>LSTM</th><th>BERT</th></tr></thead><tbody>';

    results.forEach(r => {
        const sentimentColors = {
            'POSITIVE': '#4caf50',
            'NEGATIVE': '#f44336',
            'NEUTRAL': '#ff9800'
        };
        html += `<tr>
            <td style="max-width: 300px; font-size: 0.9em;">${r.text.substring(0, 50)}...</td>
            <td><span style="color: ${sentimentColors[r.naiveBayes.sentiment]};">${r.naiveBayes.sentiment}</span></td>
            <td><span style="color: ${sentimentColors[r.svm.sentiment]};">${r.svm.sentiment}</span></td>
            <td><span style="color: ${sentimentColors[r.lstm.sentiment]};">${r.lstm.sentiment}</span></td>
            <td><span style="color: ${sentimentColors[r.bert.sentiment]};">${r.bert.sentiment}</span></td>
        </tr>`;
    });

    html += '</tbody></table></div>';

    resultDiv.innerHTML = html;
}

