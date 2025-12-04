const imageClasses = {
    cat: { name: 'Mèo', confidence: 0.95, features: ['Fur', 'Whiskers', 'Ears'] },
    dog: { name: 'Chó', confidence: 0.92, features: ['Fur', 'Tail', 'Ears'] },
    car: { name: 'Xe hơi', confidence: 0.88, features: ['Wheels', 'Windows', 'Body'] },
    building: { name: 'Tòa nhà', confidence: 0.90, features: ['Windows', 'Structure', 'Roof'] }
};

function classifyImage() {
    const imageType = document.getElementById('image-select').value;
    const result = imageClasses[imageType];
    
    const resultDiv = document.getElementById('image-result');
    resultDiv.style.display = 'block';
    
    let html = `<h3><i class="fas fa-image"></i> Kết quả phân loại:</h3>`;
    html += `<div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
        <div style="font-size: 5em; margin-bottom: 15px;">
            ${imageType === 'cat' ? '🐱' : imageType === 'dog' ? '🐶' : imageType === 'car' ? '🚗' : '🏢'}
        </div>
        <h2 style="color: #667eea; margin-bottom: 10px;">${result.name}</h2>
        <p style="font-size: 1.5em; color: #4caf50; font-weight: bold;">${(result.confidence * 100).toFixed(1)}%</p>
    </div>`;
    
    html += '<h4>Đặc trưng phát hiện:</h4>';
    html += '<div style="display: flex; gap: 10px; flex-wrap: wrap;">';
    result.features.forEach(feature => {
        html += `<span style="background: #667eea; color: white; padding: 8px 15px; border-radius: 8px;">${feature}</span>`;
    });
    html += '</div>';
    
    resultDiv.innerHTML = html;
}

// Initialize
classifyImage();

