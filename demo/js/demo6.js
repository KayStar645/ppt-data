// Realistic rating matrix: Users x Items (based on MovieLens-like data)
const ratingMatrix = {
    1: { 
        'The Matrix': 5, 
        'Inception': 4, 
        'Interstellar': 0, 
        'The Dark Knight': 5, 
        'Pulp Fiction': 3, 
        'Fight Club': 0,
        'Forrest Gump': 4,
        'The Godfather': 5
    },
    2: { 
        'The Matrix': 4, 
        'Inception': 5, 
        'Interstellar': 3, 
        'The Dark Knight': 0, 
        'Pulp Fiction': 4, 
        'Fight Club': 5,
        'Forrest Gump': 0,
        'The Godfather': 4
    },
    3: { 
        'The Matrix': 0, 
        'Inception': 3, 
        'Interstellar': 5, 
        'The Dark Knight': 4, 
        'Pulp Fiction': 5, 
        'Fight Club': 3,
        'Forrest Gump': 5,
        'The Godfather': 4
    },
    4: { 
        'The Matrix': 3, 
        'Inception': 0, 
        'Interstellar': 4, 
        'The Dark Knight': 5, 
        'Pulp Fiction': 3, 
        'Fight Club': 4,
        'Forrest Gump': 4,
        'The Godfather': 5
    },
    5: {
        'The Matrix': 5,
        'Inception': 4,
        'Interstellar': 5,
        'The Dark Knight': 5,
        'Pulp Fiction': 0,
        'Fight Club': 0,
        'Forrest Gump': 3,
        'The Godfather': 0
    }
};

const items = Object.keys(ratingMatrix[1]).concat(
    Object.keys(ratingMatrix[2]),
    Object.keys(ratingMatrix[3]),
    Object.keys(ratingMatrix[4]),
    Object.keys(ratingMatrix[5] || {})
).filter((v, i, a) => a.indexOf(v) === i);

function loadUserRatings() {
    const userId = document.getElementById('user-select').value;
    // Could display current ratings here
}

// Cosine similarity - Thuật toán thực tế
function cosineSimilarity(vec1, vec2) {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    // Get common items
    const commonKeys = Object.keys(vec1).filter(key => 
        vec2[key] !== undefined && vec1[key] > 0 && vec2[key] > 0
    );
    
    if (commonKeys.length === 0) return 0;
    
    // Calculate cosine similarity
    commonKeys.forEach(key => {
        dotProduct += vec1[key] * vec2[key];
        norm1 += vec1[key] * vec1[key];
        norm2 += vec2[key] * vec2[key];
    });
    
    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    if (denominator === 0) return 0;
    
    return dotProduct / denominator;
}

// User-based Collaborative Filtering - Thuật toán thực tế
function userBasedCF(targetUser) {
    const targetRatings = ratingMatrix[targetUser];
    if (!targetRatings) return { predictions: {}, similarities: {}, topUsers: [] };
    
    // Calculate mean rating for target user (for normalization)
    const targetRatedItems = Object.keys(targetRatings).filter(item => targetRatings[item] > 0);
    const targetMean = targetRatedItems.length > 0
        ? targetRatedItems.reduce((sum, item) => sum + targetRatings[item], 0) / targetRatedItems.length
        : 0;
    
    // Normalize target user ratings
    const targetNormalized = {};
    targetRatedItems.forEach(item => {
        targetNormalized[item] = targetRatings[item] - targetMean;
    });
    
    const similarities = {};
    
    // Calculate similarity with all other users
    Object.keys(ratingMatrix).forEach(user => {
        if (user !== targetUser) {
            const otherRatings = ratingMatrix[user];
            const otherRatedItems = Object.keys(otherRatings).filter(item => otherRatings[item] > 0);
            const otherMean = otherRatedItems.length > 0
                ? otherRatedItems.reduce((sum, item) => sum + otherRatings[item], 0) / otherRatedItems.length
                : 0;
            
            // Normalize other user ratings
            const otherNormalized = {};
            otherRatedItems.forEach(item => {
                otherNormalized[item] = otherRatings[item] - otherMean;
            });
            
            // Calculate cosine similarity on normalized ratings
            similarities[user] = cosineSimilarity(targetNormalized, otherNormalized);
        }
    });
    
    // Find top similar users (at least 2, up to 5)
    const topUsers = Object.entries(similarities)
        .filter(([_, sim]) => sim > 0) // Only positive similarities
        .sort((a, b) => b[1] - a[1])
        .slice(0, Math.min(5, Object.keys(similarities).length));
    
    // Predict ratings for unrated items
    const predictions = {};
    items.forEach(item => {
        if (!targetRatings[item] || targetRatings[item] === 0) {
            let numerator = 0;
            let denominator = 0;
            
            topUsers.forEach(([user, sim]) => {
                const otherRatings = ratingMatrix[user];
                if (otherRatings[item] && otherRatings[item] > 0) {
                    // Calculate mean for other user
                    const otherRatedItems = Object.keys(otherRatings).filter(i => otherRatings[i] > 0);
                    const otherMean = otherRatedItems.length > 0
                        ? otherRatedItems.reduce((sum, i) => sum + otherRatings[i], 0) / otherRatedItems.length
                        : 0;
                    
                    // Weighted prediction: sim * (rating - mean)
                    numerator += sim * (otherRatings[item] - otherMean);
                    denominator += Math.abs(sim);
                }
            });
            
            if (denominator > 0) {
                // Add back target user's mean
                predictions[item] = targetMean + (numerator / denominator);
                // Clamp to 1-5 range
                predictions[item] = Math.max(1, Math.min(5, predictions[item]));
            }
        }
    });
    
    return { predictions, similarities, topUsers };
}

// Item-based Collaborative Filtering
function itemBasedCF(targetUser) {
    const targetRatings = ratingMatrix[targetUser];
    const predictions = {};
    
    items.forEach(item => {
        if (targetRatings[item] === 0 || !targetRatings[item]) {
            let numerator = 0;
            let denominator = 0;
            
            items.forEach(otherItem => {
                if (targetRatings[otherItem] && targetRatings[otherItem] > 0) {
                    // Calculate item-item similarity
                    const item1Ratings = {};
                    const item2Ratings = {};
                    
                    Object.keys(ratingMatrix).forEach(user => {
                        if (ratingMatrix[user][item] && ratingMatrix[user][otherItem]) {
                            item1Ratings[user] = ratingMatrix[user][item];
                            item2Ratings[user] = ratingMatrix[user][otherItem];
                        }
                    });
                    
                    const sim = cosineSimilarity(item1Ratings, item2Ratings);
                    if (sim > 0) {
                        numerator += sim * targetRatings[otherItem];
                        denominator += Math.abs(sim);
                    }
                }
            });
            
            if (denominator > 0) {
                predictions[item] = numerator / denominator;
            }
        }
    });
    
    return { predictions };
}

// Matrix Factorization (simplified)
function matrixFactorization(targetUser) {
    const targetRatings = ratingMatrix[targetUser];
    const predictions = {};
    
    // Simulate matrix factorization with latent factors
    const numFactors = 3;
    const userFactors = {};
    const itemFactors = {};
    
    // Initialize factors (in real implementation, these would be learned)
    Object.keys(ratingMatrix).forEach(user => {
        userFactors[user] = Array(numFactors).fill(0).map(() => Math.random());
    });
    
    items.forEach(item => {
        itemFactors[item] = Array(numFactors).fill(0).map(() => Math.random());
    });
    
    // Predict ratings
    items.forEach(item => {
        if (targetRatings[item] === 0 || !targetRatings[item]) {
            let prediction = 0;
            for (let f = 0; f < numFactors; f++) {
                prediction += userFactors[targetUser][f] * itemFactors[item][f];
            }
            predictions[item] = Math.max(1, Math.min(5, prediction * 2.5)); // Scale to 1-5
        }
    });
    
    return { predictions, userFactors, itemFactors };
}

function generateRecommendations() {
    const userId = document.getElementById('user-select').value;
    const method = document.getElementById('method-select').value;
    
    let result;
    let methodName;
    
    switch(method) {
        case 'user-based':
            result = userBasedCF(userId);
            methodName = 'User-based Collaborative Filtering';
            break;
        case 'item-based':
            result = itemBasedCF(userId);
            methodName = 'Item-based Collaborative Filtering';
            break;
        case 'matrix':
            result = matrixFactorization(userId);
            methodName = 'Matrix Factorization';
            break;
    }
    
    displayRecommendations(result, userId, methodName, method);
}

function displayRecommendations(result, userId, methodName, method) {
    const resultDiv = document.getElementById('recommendation-result');
    resultDiv.style.display = 'block';
    
    const targetRatings = ratingMatrix[userId];
    const predictions = Object.entries(result.predictions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    let html = `<h3><i class="fas fa-star"></i> Gợi ý cho Người dùng ${userId} (${methodName}):</h3>`;
    
    // Current ratings
    html += '<h4>Đánh giá hiện tại:</h4>';
    html += '<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">';
    items.forEach(item => {
        if (targetRatings[item] && targetRatings[item] > 0) {
            html += `<div style="background: #4caf50; color: white; padding: 8px 15px; border-radius: 8px;">
                ${item}: ${'★'.repeat(targetRatings[item])}${'☆'.repeat(5 - targetRatings[item])}
            </div>`;
        }
    });
    html += '</div>';
    
    // Recommendations
    html += '<h4>Gợi ý sản phẩm:</h4>';
    html += '<div class="table-container"><table><thead><tr><th>Xếp hạng</th><th>Sản phẩm</th><th>Điểm dự đoán</th><th>Đánh giá sao</th></tr></thead><tbody>';
    
    predictions.forEach(([item, score], index) => {
        const stars = Math.round(score);
        html += `<tr>
            <td><strong>#${index + 1}</strong></td>
            <td><strong>${item}</strong></td>
            <td><span style="color: #667eea; font-weight: bold; font-size: 1.2em;">${score.toFixed(2)}</span></td>
            <td><span style="color: #ff9800; font-size: 1.2em;">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</span></td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    
    // Additional info for user-based
    if (method === 'user-based' && result.similarities) {
        html += '<h4 style="margin-top: 30px;">Người dùng tương tự:</h4>';
        html += '<div style="display: flex; gap: 15px; flex-wrap: wrap;">';
        result.topUsers.forEach(([user, sim]) => {
            html += `<div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <strong>Người dùng ${user}</strong><br>
                <span style="color: #667eea;">Độ tương đồng: ${(sim * 100).toFixed(1)}%</span>
            </div>`;
        });
        html += '</div>';
    }
    
    resultDiv.innerHTML = html;
}

