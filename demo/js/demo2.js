// Sample documents
const datasets = {
    news: [
        "Apple công bố iPhone mới với công nghệ AI tiên tiến. Giá bán dự kiến sẽ cao hơn thế hệ trước.",
        "Microsoft phát triển hệ điều hành mới với tính năng bảo mật nâng cao. Người dùng đánh giá tích cực.",
        "Google ra mắt công cụ tìm kiếm thông minh sử dụng machine learning. Kết quả tìm kiếm chính xác hơn.",
        "Tesla phát triển xe điện tự lái với công nghệ AI. An toàn và tiết kiệm năng lượng.",
        "Amazon mở rộng dịch vụ cloud computing. Doanh thu tăng trưởng mạnh."
    ],
    reviews: [
        "Sản phẩm chất lượng tốt, giá cả hợp lý. Giao hàng nhanh chóng.",
        "Dịch vụ khách hàng tuyệt vời. Nhân viên nhiệt tình và chuyên nghiệp.",
        "Sản phẩm không đúng như mô tả. Chất lượng kém, không đáng tiền.",
        "Đóng gói cẩn thận, sản phẩm nguyên vẹn. Hài lòng với dịch vụ.",
        "Giao hàng chậm, sản phẩm bị hỏng. Dịch vụ kém."
    ],
    research: [
        "Machine learning algorithms improve accuracy in data classification tasks.",
        "Deep neural networks show promising results in image recognition.",
        "Natural language processing enables better text understanding.",
        "Computer vision applications in autonomous vehicles are advancing rapidly."
    ]
};

let currentDataset = datasets.news;

function loadDataset() {
    const select = document.getElementById('dataset-select');
    currentDataset = datasets[select.value];
}

// Simplified LDA simulation
function performLDA() {
    const numTopics = parseInt(document.getElementById('num-topics').value);
    const documents = currentDataset;
    
    // Extract vocabulary
    const vocabulary = new Set();
    documents.forEach(doc => {
        doc.toLowerCase().split(/\s+/).forEach(word => {
            if (word.length > 2) vocabulary.add(word);
        });
    });
    
    // Simulate topic-word distributions
    const topics = [];
    const vocabArray = Array.from(vocabulary);
    
    for (let k = 0; k < numTopics; k++) {
        const topicWords = {};
        vocabArray.forEach(word => {
            topicWords[word] = Math.random();
        });
        // Normalize
        const sum = Object.values(topicWords).reduce((a, b) => a + b, 0);
        Object.keys(topicWords).forEach(word => {
            topicWords[word] /= sum;
        });
        topics.push(topicWords);
    }
    
    // Assign documents to topics
    const docTopics = documents.map(doc => {
        const words = doc.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        const topicDist = new Array(numTopics).fill(0);
        
        words.forEach(word => {
            topics.forEach((topic, k) => {
                if (topic[word]) {
                    topicDist[k] += topic[word];
                }
            });
        });
        
        // Normalize
        const sum = topicDist.reduce((a, b) => a + b, 0);
        return topicDist.map(t => sum > 0 ? t / sum : 1 / numTopics);
    });
    
    displayLDAResults(topics, docTopics, documents, vocabArray);
}

function displayLDAResults(topics, docTopics, documents, vocabulary) {
    const resultDiv = document.getElementById('lda-result');
    resultDiv.style.display = 'block';
    
    let html = '<h3><i class="fas fa-check-circle"></i> Kết quả LDA:</h3>';
    
    // Display topics
    html += '<h4 style="margin-top: 20px;">Các chủ đề được phát hiện:</h4>';
    topics.forEach((topic, k) => {
        const topWords = Object.entries(topic)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, prob]) => ({ word, prob }));
        
        html += `<div class="result-item" style="margin-bottom: 20px;">
            <h4 style="color: #667eea;">Chủ đề ${k + 1}:</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">`;
        
        topWords.forEach(({ word, prob }) => {
            const size = Math.max(12, prob * 30);
            html += `<span style="background: #667eea; color: white; padding: 5px 10px; border-radius: 5px; font-size: ${size}px; display: inline-block;">
                ${word} (${(prob * 100).toFixed(1)}%)
            </span>`;
        });
        
        html += '</div></div>';
    });
    
    // Document-topic distribution
    html += '<h4 style="margin-top: 30px;">Phân bố chủ đề cho từng tài liệu:</h4>';
    html += '<div class="table-container"><table><thead><tr><th>Tài liệu</th>';
    for (let k = 0; k < topics.length; k++) {
        html += `<th>Chủ đề ${k + 1}</th>`;
    }
    html += '</tr></thead><tbody>';
    
    documents.forEach((doc, i) => {
        html += `<tr><td style="max-width: 300px; font-size: 0.9em;">${doc.substring(0, 50)}...</td>`;
        docTopics[i].forEach(prob => {
            const color = prob > 0.5 ? '#4caf50' : prob > 0.3 ? '#ff9800' : '#f44336';
            html += `<td><span style="color: ${color}; font-weight: bold;">${(prob * 100).toFixed(1)}%</span></td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    
    resultDiv.innerHTML = html;
}

