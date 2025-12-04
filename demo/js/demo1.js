// Named Entity Recognition - Multiple Algorithms
function performNER() {
    const text = document.getElementById('ner-text').value;
    const algorithm = document.getElementById('ner-algorithm').value;
    
    if (!text.trim()) {
        alert('Vui lòng nhập văn bản!');
        return;
    }

    const stepsDiv = document.getElementById('ner-steps');
    const resultDiv = document.getElementById('ner-result');
    stepsDiv.style.display = 'block';
    resultDiv.style.display = 'none';
    
    // Clear previous results
    stepsDiv.innerHTML = '<h3><i class="fas fa-cog fa-spin"></i> Đang xử lý...</h3>';
    
    setTimeout(() => {
        let entities, steps;
        
        switch(algorithm) {
            case 'rule-based':
                ({entities, steps} = ruleBasedNER(text));
                break;
            case 'crf':
                ({entities, steps} = crfNER(text));
                break;
            case 'lstm':
                ({entities, steps} = lstmNER(text));
                break;
            case 'bert':
                ({entities, steps} = bertNER(text));
                break;
        }
        
        displayNERSteps(steps, algorithm);
        displayNERResults(entities, text);
    }, 500);
}

// Rule-based NER
function ruleBasedNER(text) {
    const steps = [];
    const entities = {
        PERSON: [],
        ORGANIZATION: [],
        LOCATION: [],
        DATE: [],
        MONEY: []
    };
    
    steps.push({
        step: 1,
        title: 'Bước 1: Tokenization',
        description: 'Chia văn bản thành các từ (tokens)',
        data: text.split(/\s+/)
    });
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    steps.push({
        step: 2,
        title: 'Bước 2: Sentence Segmentation',
        description: 'Chia văn bản thành các câu',
        data: sentences
    });
    
    // Extract PERSON
    steps.push({
        step: 3,
        title: 'Bước 3: Phát hiện PERSON',
        description: 'Tìm các từ viết hoa liền nhau (Proper Nouns)',
        data: []
    });
    
    sentences.forEach((sentence, sentIdx) => {
        const sentWords = sentence.trim().split(/\s+/);
        sentWords.forEach((word, idx) => {
            if (idx < sentWords.length - 1) {
                const nextWord = sentWords[idx + 1];
                if (/^[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+$/.test(word) &&
                    /^[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+$/.test(nextWord) &&
                    word.length > 2 && nextWord.length > 2 && !isCommonWord(word)) {
                    const personName = `${word} ${nextWord}`;
                    if (!entities.PERSON.includes(personName)) {
                        entities.PERSON.push(personName);
                        steps[2].data.push(`Phát hiện: "${personName}" (2 từ viết hoa liền nhau)`);
                    }
                }
            }
        });
    });
    
    // Extract ORGANIZATION
    steps.push({
        step: 4,
        title: 'Bước 4: Phát hiện ORGANIZATION',
        description: 'Tìm từ viết hoa kèm keywords (công ty, tập đoàn, inc, ltd)',
        data: []
    });
    
    const orgKeywords = ['công ty', 'tập đoàn', 'corporation', 'inc', 'ltd', 'company'];
    sentences.forEach(sentence => {
        orgKeywords.forEach(keyword => {
            try {
                const regex = new RegExp(`([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\\s+[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)\\s+${keyword}`, 'gi');
                const match = sentence.match(regex);
                if (match && match[1] && match[1].trim) {
                    const org = match[1].trim();
                    if (org && !entities.ORGANIZATION.includes(org)) {
                        entities.ORGANIZATION.push(org);
                        steps[3].data.push(`Phát hiện: "${org}" (có keyword "${keyword}")`);
                    }
                }
            } catch (e) {
                console.log('Error matching organization keyword:', keyword, e);
            }
        });
        
        // Standalone capitalized words
        const standaloneOrgs = sentence.match(/\b([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]{3,}(?:\s+[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)\b/g);
        if (standaloneOrgs) {
            standaloneOrgs.forEach(org => {
                if (!entities.ORGANIZATION.includes(org) && 
                    !entities.PERSON.some(p => p.includes(org)) &&
                    org.length > 3) {
                    entities.ORGANIZATION.push(org);
                    steps[3].data.push(`Phát hiện: "${org}" (từ viết hoa đơn lẻ)`);
                }
            });
        }
    });
    
    // Extract LOCATION
    steps.push({
        step: 5,
        title: 'Bước 5: Phát hiện LOCATION',
        description: 'Tìm từ viết hoa sau location indicators (tại, ở, từ, đến)',
        data: []
    });
    
    const locationIndicators = ['tại', 'ở', 'từ', 'đến', 'về', 'in', 'at', 'from', 'to'];
    sentences.forEach(sentence => {
        locationIndicators.forEach(indicator => {
            try {
                const regex = new RegExp(`${indicator}\\s+([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\\s+[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)`, 'gi');
                const match = sentence.match(regex);
                if (match && match[1] && match[1].trim) {
                    const location = match[1].trim();
                    if (location && !entities.LOCATION.includes(location) && location.length > 2) {
                        entities.LOCATION.push(location);
                        steps[4].data.push(`Phát hiện: "${location}" (sau "${indicator}")`);
                    }
                }
            } catch (e) {
                console.log('Error matching location indicator:', indicator, e);
            }
        });
    });
    
    // Extract DATE
    steps.push({
        step: 6,
        title: 'Bước 6: Phát hiện DATE',
        description: 'Tìm các pattern ngày tháng',
        data: []
    });
    
    const datePatterns = [
        /\b(\d{1,2}\s*(?:tháng|ngày)\s*\d{1,2},?\s*\d{4})\b/gi,
        /\b(\d{4})\b/g,
        /\b(năm\s+\d{4})\b/gi,
        /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/g
    ];
    
    datePatterns.forEach((pattern, idx) => {
        const matches = text.match(pattern);
        if (matches) {
            matches.forEach(match => {
                if (match && !entities.DATE.includes(match)) {
                    entities.DATE.push(match);
                    steps[5].data.push(`Pattern ${idx + 1}: "${match}"`);
                }
            });
        }
    });
    
    // Extract MONEY
    steps.push({
        step: 7,
        title: 'Bước 7: Phát hiện MONEY',
        description: 'Tìm các pattern tiền tệ',
        data: []
    });
    
    const moneyPatterns = [
        /\b(\d+[\s,]*(?:tỷ|triệu|nghìn|billion|million)?\s*(?:USD|đô la|VND|đồng)?)\b/gi,
        /\b(\$\s*\d+[\s,]*(?:\.\d+)?)\b/g
    ];
    
    moneyPatterns.forEach((pattern, idx) => {
        const matches = text.match(pattern);
        if (matches) {
            matches.forEach(match => {
                if (match && match.trim && /\d/.test(match)) {
                    const trimmed = match.trim();
                    if (trimmed && !entities.MONEY.includes(trimmed)) {
                        entities.MONEY.push(trimmed);
                        steps[6].data.push(`Pattern ${idx + 1}: "${trimmed}"`);
                    }
                }
            });
        }
    });
    
    return {entities, steps};
}

// CRF NER (simulated)
function crfNER(text) {
    const steps = [];
    const entities = {
        PERSON: [],
        ORGANIZATION: [],
        LOCATION: [],
        DATE: [],
        MONEY: []
    };
    
    steps.push({
        step: 1,
        title: 'Bước 1: Feature Extraction',
        description: 'Trích xuất features cho mỗi token',
        data: ['Word features: capitalization, length, position', 'Context features: previous/next words', 'Morphological features: prefixes, suffixes']
    });
    
    const words = text.split(/\s+/);
    steps.push({
        step: 2,
        title: 'Bước 2: Token Features',
        description: 'Tính toán features cho từng token',
        data: words.slice(0, 10).map((word, idx) => {
            const features = {
                word: word,
                isCapitalized: /^[A-ZĐ]/.test(word),
                length: word.length,
                hasNumbers: /\d/.test(word),
                position: idx
            };
            return `${word}: ${JSON.stringify(features)}`;
        })
    });
    
    steps.push({
        step: 3,
        title: 'Bước 3: CRF Model Prediction',
        description: 'Sử dụng CRF để dự đoán label cho mỗi token (BIO tagging)',
        data: []
    });
    
    // Simulate CRF prediction with BIO tags
    const bioTags = [];
    words.forEach((word, idx) => {
        let tag = 'O';
        const isCap = /^[A-ZĐ]/.test(word);
        const nextWord = words[idx + 1];
        const isNextCap = nextWord && /^[A-ZĐ]/.test(nextWord);
        
        if (isCap && isNextCap && word.length > 2) {
            tag = idx === 0 || bioTags[idx - 1] === 'O' ? 'B-PERSON' : 'I-PERSON';
        } else if (isCap && word.length > 3 && !isNextCap) {
            tag = 'B-ORGANIZATION';
        } else if (/\d{4}/.test(word)) {
            tag = 'B-DATE';
        } else if (/\d/.test(word) && /USD|VND|đô|tỷ|triệu/.test(text.substring(text.indexOf(word) - 10, text.indexOf(word) + 20))) {
            tag = 'B-MONEY';
        }
        
        bioTags.push(tag);
        if (tag !== 'O') {
            steps[2].data.push(`${word} → ${tag}`);
        }
    });
    
    steps.push({
        step: 4,
        title: 'Bước 4: Entity Extraction từ BIO Tags',
        description: 'Chuyển đổi BIO tags thành entities',
        data: []
    });
    
    let currentEntity = null;
    let currentType = null;
    bioTags.forEach((tag, idx) => {
        if (tag.startsWith('B-')) {
            if (currentEntity) {
                entities[currentType].push(currentEntity);
                steps[3].data.push(`Entity: "${currentEntity}" (${currentType})`);
            }
            currentType = tag.substring(2);
            currentEntity = words[idx];
        } else if (tag.startsWith('I-') && currentType === tag.substring(2)) {
            currentEntity += ' ' + words[idx];
        } else if (tag === 'O' && currentEntity) {
            entities[currentType].push(currentEntity);
            steps[3].data.push(`Entity: "${currentEntity}" (${currentType})`);
            currentEntity = null;
            currentType = null;
        }
    });
    if (currentEntity) {
        entities[currentType].push(currentEntity);
        steps[3].data.push(`Entity: "${currentEntity}" (${currentType})`);
    }
    
    return {entities, steps};
}

// LSTM NER (simulated)
function lstmNER(text) {
    const steps = [];
    const entities = {
        PERSON: [],
        ORGANIZATION: [],
        LOCATION: [],
        DATE: [],
        MONEY: []
    };
    
    steps.push({
        step: 1,
        title: 'Bước 1: Word Embedding',
        description: 'Chuyển đổi từ thành vector (word embeddings)',
        data: ['Sử dụng pre-trained embeddings (Word2Vec, GloVe)', 'Mỗi từ được biểu diễn bằng vector 100-300 chiều']
    });
    
    const words = text.split(/\s+/);
    steps.push({
        step: 2,
        title: 'Bước 2: Sequence Input',
        description: 'Tạo sequence từ embeddings',
        data: [`Input sequence: ${words.length} tokens`, `Embedding dimension: 300`, `Sequence: [${words.slice(0, 5).join(', ')}...]`]
    });
    
    steps.push({
        step: 3,
        title: 'Bước 3: LSTM Forward Pass',
        description: 'LSTM xử lý sequence từ trái sang phải',
        data: ['Hidden state h_t = f(W * [x_t, h_{t-1}] + b)', 'Cell state c_t = f_t ⊙ c_{t-1} + i_t ⊙ tanh(W_c * [h_{t-1}, x_t])', 'Output o_t = σ(W_o * [h_{t-1}, x_t] + b_o)']
    });
    
    steps.push({
        step: 4,
        title: 'Bước 4: Bidirectional LSTM',
        description: 'Kết hợp forward và backward LSTM',
        data: ['Forward LSTM: x_1 → x_2 → ... → x_n', 'Backward LSTM: x_n → x_{n-1} → ... → x_1', 'Concatenate: [h_forward, h_backward]']
    });
    
    steps.push({
        step: 5,
        title: 'Bước 5: Classification Layer',
        description: 'Dự đoán label cho mỗi token',
        data: []
    });
    
    // Simulate LSTM predictions
    words.forEach((word, idx) => {
        const isCap = /^[A-ZĐ]/.test(word);
        const nextWord = words[idx + 1];
        const isNextCap = nextWord && /^[A-ZĐ]/.test(nextWord);
        
        let predictedLabel = 'O';
        let confidence = 0.5;
        
        if (isCap && isNextCap && word.length > 2) {
            predictedLabel = 'PERSON';
            confidence = 0.85;
        } else if (isCap && word.length > 3) {
            predictedLabel = 'ORGANIZATION';
            confidence = 0.75;
        } else if (/\d{4}/.test(word)) {
            predictedLabel = 'DATE';
            confidence = 0.95;
        }
        
        if (predictedLabel !== 'O') {
            steps[4].data.push(`${word}: ${predictedLabel} (confidence: ${(confidence * 100).toFixed(0)}%)`);
            entities[predictedLabel].push(word);
        }
    });
    
    return {entities, steps};
}

// BERT NER (simulated)
function bertNER(text) {
    const steps = [];
    const entities = {
        PERSON: [],
        ORGANIZATION: [],
        LOCATION: [],
        DATE: [],
        MONEY: []
    };
    
    steps.push({
        step: 1,
        title: 'Bước 1: Tokenization (WordPiece)',
        description: 'Chia từ thành subword tokens',
        data: []
    });
    
    const words = text.split(/\s+/);
    words.slice(0, 5).forEach(word => {
        const tokens = word.length > 4 ? [word.substring(0, 3), '##' + word.substring(3)] : [word];
        steps[0].data.push(`${word} → [${tokens.join(', ')}]`);
    });
    
    steps.push({
        step: 2,
        title: 'Bước 2: Add Special Tokens',
        description: 'Thêm [CLS] và [SEP] tokens',
        data: [`[CLS] ${words.slice(0, 3).join(' ')} [SEP]`, 'CLS: Classification token', 'SEP: Separator token']
    });
    
    steps.push({
        step: 3,
        title: 'Bước 3: Position Embeddings',
        description: 'Thêm positional encodings',
        data: ['Position embeddings: sin/cos functions', 'Token embeddings: WordPiece embeddings', 'Segment embeddings: sentence A/B']
    });
    
    steps.push({
        step: 4,
        title: 'Bước 4: Transformer Encoder (12 layers)',
        description: 'Multi-head self-attention + Feed-forward',
        data: [
            'Layer 1-12: Self-attention mechanism',
            'Attention(Q, K, V) = softmax(QK^T/√d_k) * V',
            'Feed-forward: FFN(x) = max(0, xW_1 + b_1)W_2 + b_2'
        ]
    });
    
    steps.push({
        step: 5,
        title: 'Bước 5: Entity Classification',
        description: 'Dự đoán entity label cho mỗi token',
        data: []
    });
    
    // Simulate BERT predictions
    words.forEach((word, idx) => {
        const isCap = /^[A-ZĐ]/.test(word);
        const context = text.substring(Math.max(0, text.indexOf(word) - 20), Math.min(text.length, text.indexOf(word) + 20));
        
        let predictedLabel = 'O';
        let confidence = 0.5;
        
        if (isCap && word.length > 2) {
            if (/\b(là|CEO|giám đốc|founder|thành lập)\b/i.test(context)) {
                predictedLabel = 'PERSON';
                confidence = 0.92;
            } else if (/\b(công ty|tập đoàn|company|corporation)\b/i.test(context)) {
                predictedLabel = 'ORGANIZATION';
                confidence = 0.88;
            } else if (/\b(tại|ở|in|at|from)\b/i.test(context)) {
                predictedLabel = 'LOCATION';
                confidence = 0.85;
            }
        } else if (/\d{4}/.test(word)) {
            predictedLabel = 'DATE';
            confidence = 0.95;
        } else if (/\d/.test(word) && /USD|VND|đô|tỷ|triệu/.test(context)) {
            predictedLabel = 'MONEY';
            confidence = 0.90;
        }
        
        if (predictedLabel !== 'O') {
            steps[4].data.push(`${word}: ${predictedLabel} (confidence: ${(confidence * 100).toFixed(0)}%)`);
            if (!entities[predictedLabel].includes(word)) {
                entities[predictedLabel].push(word);
            }
        }
    });
    
    return {entities, steps};
}

function displayNERSteps(steps, algorithm) {
    const stepsDiv = document.getElementById('ner-steps');
    const algorithmNames = {
        'rule-based': 'Rule-based (Pattern Matching)',
        'crf': 'CRF (Conditional Random Fields)',
        'lstm': 'LSTM (Long Short-Term Memory)',
        'bert': 'BERT (Bidirectional Encoder Representations)'
    };
    
    let html = `<h3><i class="fas fa-list-ol"></i> Các bước xử lý - ${algorithmNames[algorithm]}</h3>`;
    
    steps.forEach(step => {
        html += `<div class="step-box">
            <h4 style="color: #667eea; margin-bottom: 10px;">
                <i class="fas fa-step-forward"></i> ${step.title}
            </h4>
            <p style="color: #666; margin-bottom: 10px;">${step.description}</p>`;
        
        if (step.data && step.data.length > 0) {
            if (Array.isArray(step.data[0])) {
                html += '<div class="algorithm-step">';
                step.data.forEach(item => {
                    html += `<div>${item}</div>`;
                });
                html += '</div>';
            } else {
                html += '<div class="algorithm-step">';
                step.data.forEach((item, idx) => {
                    html += `<div style="margin: 5px 0;">${idx + 1}. ${item}</div>`;
                });
                html += '</div>';
            }
        }
        
        html += '</div>';
    });
    
    stepsDiv.innerHTML = html;
}

function displayNERResults(entities, originalText) {
    const resultDiv = document.getElementById('ner-result');
    resultDiv.style.display = 'block';
    
    let html = '<h3><i class="fas fa-check-circle"></i> Kết quả NER:</h3>';
    
    let highlightedText = originalText;
    const colors = {
        PERSON: '#ff6b6b',
        ORGANIZATION: '#4ecdc4',
        LOCATION: '#95e1d3',
        DATE: '#f38181',
        MONEY: '#aa96da'
    };

    const labels = {
        PERSON: 'Người',
        ORGANIZATION: 'Tổ chức',
        LOCATION: 'Địa điểm',
        DATE: 'Ngày tháng',
        MONEY: 'Tiền tệ'
    };

    // Highlight entities in text
    for (const [type, items] of Object.entries(entities)) {
        items.forEach(item => {
            const regex = new RegExp(`(${item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            highlightedText = highlightedText.replace(regex, `<span style="background: ${colors[type]}; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;">$1</span>`);
        });
    }

    html += `<div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; line-height: 1.8;">${highlightedText}</div>`;
    
    html += '<div class="grid-2">';
    for (const [type, items] of Object.entries(entities)) {
        if (items.length > 0) {
            html += `<div class="result-item">
                <strong style="color: ${colors[type]};">${labels[type]} (${items.length}):</strong><br>
                ${items.map(item => `<span style="background: ${colors[type]}; color: white; padding: 3px 8px; border-radius: 5px; margin: 3px; display: inline-block;">${item}</span>`).join('')}
            </div>`;
        }
    }
    html += '</div>';

    resultDiv.innerHTML = html;
}

// Helper function
function isCommonWord(word) {
    const commonWords = ['The', 'A', 'An', 'This', 'That', 'These', 'Those', 'Của', 'Và', 'Hoặc', 'Nhưng', 'Tuy', 'Nếu', 'Khi', 'Vì', 'Do', 'Từ', 'Đến', 'Về', 'Tại', 'Ở'];
    return commonWords.includes(word);
}

// Relation Extraction - Multiple Algorithms
function extractRelations() {
    const text = document.getElementById('relation-text').value;
    const algorithm = document.getElementById('relation-algorithm').value;
    
    if (!text.trim()) {
        alert('Vui lòng nhập văn bản!');
        return;
    }

    const stepsDiv = document.getElementById('relation-steps');
    const resultDiv = document.getElementById('relation-result');
    stepsDiv.style.display = 'block';
    resultDiv.style.display = 'none';
    
    stepsDiv.innerHTML = '<h3><i class="fas fa-cog fa-spin"></i> Đang xử lý...</h3>';
    
    setTimeout(() => {
        let relations, steps;
        
        switch(algorithm) {
            case 'pattern-based':
                ({relations, steps} = patternBasedRelationExtraction(text));
                break;
            case 'dependency':
                ({relations, steps} = dependencyParsingRelationExtraction(text));
                break;
            case 'neural':
                ({relations, steps} = neuralRelationExtraction(text));
                break;
            case 'distant-supervision':
                ({relations, steps} = distantSupervisionRelationExtraction(text));
                break;
        }
        
        displayRelationSteps(steps, algorithm);
        displayRelations(relations);
    }, 500);
}

// Pattern-based Relation Extraction
function patternBasedRelationExtraction(text) {
    const steps = [];
    const relations = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    steps.push({
        step: 1,
        title: 'Bước 1: Sentence Segmentation',
        description: 'Chia văn bản thành các câu',
        data: sentences
    });
    
    steps.push({
        step: 2,
        title: 'Bước 2: Pattern Matching',
        description: 'Áp dụng các pattern rules để tìm quan hệ',
        data: []
    });
    
    sentences.forEach(sentence => {
        // CEO_OF pattern
        const ceoPattern = /([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\s+[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)\s+là\s+(CEO|giám đốc|chủ tịch)\s+của\s+([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\s+[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)/i;
        const ceoMatch = sentence.match(ceoPattern);
        if (ceoMatch) {
            relations.push({
                subject: ceoMatch[1].trim(),
                relation: 'CEO_OF',
                object: ceoMatch[3].trim(),
                sentence: sentence.trim(),
                confidence: 0.95
            });
            steps[1].data.push(`Pattern: [PERSON] là [TITLE] của [ORG] → "${ceoMatch[1]}" CEO_OF "${ceoMatch[3]}"`);
        }
        
        // LOCATED_IN pattern
        const locPattern = /([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\s+[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)\s+(có trụ sở|tọa lạc|ở|tại)\s+([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\s+[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)/i;
        const locMatch = sentence.match(locPattern);
        if (locMatch) {
            relations.push({
                subject: locMatch[1].trim(),
                relation: 'LOCATED_IN',
                object: locMatch[3].trim(),
                sentence: sentence.trim(),
                confidence: 0.85
            });
            steps[1].data.push(`Pattern: [ORG] [LOC_VERB] [LOCATION] → "${locMatch[1]}" LOCATED_IN "${locMatch[3]}"`);
        }
        
        // FOUNDED_BY pattern
        const foundedPattern = /([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\s+[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)\s+(?:được\s+)?(?:thành lập|founded)\s+(?:bởi|by)\s+([^.]+)/i;
        const foundedMatch = sentence.match(foundedPattern);
        if (foundedMatch) {
            const founders = foundedMatch[2].split(/và|,|and/).map(f => f.trim()).filter(f => f);
            founders.forEach(founder => {
                relations.push({
                    subject: foundedMatch[1].trim(),
                    relation: 'FOUNDED_BY',
                    object: founder,
                    sentence: sentence.trim(),
                    confidence: 0.90
                });
                steps[1].data.push(`Pattern: [ORG] thành lập bởi [PERSON] → "${foundedMatch[1]}" FOUNDED_BY "${founder}"`);
            });
        }
    });
    
    return {relations, steps};
}

// Dependency Parsing Relation Extraction
function dependencyParsingRelationExtraction(text) {
    const steps = [];
    const relations = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    steps.push({
        step: 1,
        title: 'Bước 1: Dependency Parsing',
        description: 'Phân tích cấu trúc câu (dependency tree)',
        data: []
    });
    
    sentences.forEach(sentence => {
        const words = sentence.split(/\s+/);
        // Simulate dependency parsing
        steps[0].data.push(`Câu: "${sentence}"`);
        steps[0].data.push(`Dependency tree: nsubj(CEO, PERSON) → dobj(CEO, ORG)`);
    });
    
    steps.push({
        step: 2,
        title: 'Bước 2: Extract Subject-Verb-Object',
        description: 'Tìm subject, verb, object từ dependency tree',
        data: []
    });
    
    sentences.forEach(sentence => {
        // CEO_OF
        if (/là\s+(CEO|giám đốc)/i.test(sentence)) {
            const match = sentence.match(/([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\s+[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)\s+là\s+(?:CEO|giám đốc)\s+của\s+([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\s+[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)/i);
            if (match && match[1] && match[2] && match[1].trim && match[2].trim) {
                const subject = match[1].trim();
                const object = match[2].trim();
                if (subject && object) {
                    relations.push({
                        subject: subject,
                        relation: 'CEO_OF',
                        object: object,
                        sentence: sentence.trim(),
                        confidence: 0.92
                    });
                    steps[1].data.push(`nsubj: "${subject}" → verb: "là" → dobj: "${object}" → CEO_OF`);
                }
            }
        }
    });
    
    return {relations, steps};
}

// Neural Relation Extraction
function neuralRelationExtraction(text) {
    const steps = [];
    const relations = [];
    
    steps.push({
        step: 1,
        title: 'Bước 1: Entity Pair Extraction',
        description: 'Tìm tất cả các cặp entities trong câu',
        data: []
    });
    
    steps.push({
        step: 2,
        title: 'Bước 2: Context Encoding',
        description: 'Mã hóa ngữ cảnh giữa 2 entities bằng CNN/LSTM',
        data: ['CNN: Convolutional layers để capture local patterns', 'LSTM: Sequence modeling để capture long dependencies']
    });
    
    steps.push({
        step: 3,
        title: 'Bước 3: Relation Classification',
        description: 'Phân loại quan hệ giữa 2 entities',
        data: []
    });
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    sentences.forEach(sentence => {
        const entities = sentence.match(/[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\s+[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*/g) || [];
        
        if (entities.length >= 2) {
            steps[0].data.push(`Entity pairs: ${entities.slice(0, 2).join(' ↔ ')}`);
            
            // Simulate neural prediction
            if (/là\s+(CEO|giám đốc)/i.test(sentence)) {
                relations.push({
                    subject: entities[0],
                    relation: 'CEO_OF',
                    object: entities[1],
                    sentence: sentence.trim(),
                    confidence: 0.88
                });
                steps[2].data.push(`${entities[0]} ↔ ${entities[1]}: CEO_OF (confidence: 88%)`);
            }
        }
    });
    
    return {relations, steps};
}

// Distant Supervision Relation Extraction
function distantSupervisionRelationExtraction(text) {
    const steps = [];
    const relations = [];
    
    steps.push({
        step: 1,
        title: 'Bước 1: Knowledge Base Alignment',
        description: 'So khớp entities với Knowledge Base (Freebase, Wikidata)',
        data: ['Freebase: 40M entities, 35K relations', 'Wikidata: 100M+ entities']
    });
    
    steps.push({
        step: 2,
        title: 'Bước 2: Distant Labeling',
        description: 'Gán nhãn tự động dựa trên KB',
        data: ['Nếu (e1, relation, e2) có trong KB → positive example', 'Ngược lại → negative example']
    });
    
    steps.push({
        step: 3,
        title: 'Bước 3: Feature Extraction & Training',
        description: 'Trích xuất features và train model',
        data: ['Features: lexical, syntactic, semantic', 'Model: Multi-instance learning']
    });
    
    // Simulate distant supervision
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    sentences.forEach(sentence => {
        if (/là\s+(CEO|giám đốc)/i.test(sentence)) {
            const match = sentence.match(/([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\s+[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)\s+là\s+(?:CEO|giám đốc)\s+của\s+([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\s+[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)/i);
            if (match && match[1] && match[2] && match[1].trim && match[2].trim) {
                const subject = match[1].trim();
                const object = match[2].trim();
                if (subject && object) {
                    relations.push({
                        subject: subject,
                        relation: 'CEO_OF',
                        object: object,
                        sentence: sentence.trim(),
                        confidence: 0.90
                    });
                    steps[2].data.push(`KB match found: "${subject}" CEO_OF "${object}"`);
                }
            }
        }
    });
    
    return {relations, steps};
}

function displayRelationSteps(steps, algorithm) {
    const stepsDiv = document.getElementById('relation-steps');
    const algorithmNames = {
        'pattern-based': 'Pattern-based (Rule-based)',
        'dependency': 'Dependency Parsing',
        'neural': 'Neural Networks',
        'distant-supervision': 'Distant Supervision'
    };
    
    let html = `<h3><i class="fas fa-list-ol"></i> Các bước xử lý - ${algorithmNames[algorithm]}</h3>`;
    
    steps.forEach(step => {
        html += `<div class="step-box">
            <h4 style="color: #667eea; margin-bottom: 10px;">
                <i class="fas fa-step-forward"></i> ${step.title}
            </h4>
            <p style="color: #666; margin-bottom: 10px;">${step.description}</p>`;
        
        if (step.data && step.data.length > 0) {
            html += '<div class="algorithm-step">';
            step.data.forEach((item, idx) => {
                html += `<div style="margin: 5px 0;">${item}</div>`;
            });
            html += '</div>';
        }
        
        html += '</div>';
    });
    
    stepsDiv.innerHTML = html;
}

function displayRelations(relations) {
    const resultDiv = document.getElementById('relation-result');
    resultDiv.style.display = 'block';
    
    if (relations.length === 0) {
        resultDiv.innerHTML = '<div class="alert alert-info">Không tìm thấy quan hệ nào trong văn bản.</div>';
        return;
    }

    let html = '<h3><i class="fas fa-project-diagram"></i> Các quan hệ được trích xuất:</h3>';
    html += '<div class="table-container"><table><thead><tr><th>Chủ thể</th><th>Quan hệ</th><th>Đối tượng</th><th>Độ tin cậy</th><th>Câu</th></tr></thead><tbody>';

    relations.forEach(rel => {
        const relationLabels = {
            'CEO_OF': 'CEO của',
            'LOCATED_IN': 'Tọa lạc tại',
            'FOUNDED_BY': 'Được thành lập bởi',
            'WORKS_FOR': 'Làm việc tại'
        };
        
        const confidenceColor = rel.confidence >= 0.9 ? '#4caf50' : rel.confidence >= 0.8 ? '#ff9800' : '#f44336';
        
        html += `<tr>
            <td><strong>${rel.subject}</strong></td>
            <td><span style="color: #667eea; font-weight: bold;">${relationLabels[rel.relation] || rel.relation}</span></td>
            <td><strong>${rel.object}</strong></td>
            <td><span style="color: ${confidenceColor}; font-weight: bold;">${(rel.confidence * 100).toFixed(0)}%</span></td>
            <td style="font-style: italic; color: #666; font-size: 0.9em;">${rel.sentence}</td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    resultDiv.innerHTML = html;
}

// Event Extraction - Multiple Algorithms
function extractEvents() {
    const text = document.getElementById('event-text').value;
    const algorithm = document.getElementById('event-algorithm').value;
    
    if (!text.trim()) {
        alert('Vui lòng nhập văn bản!');
        return;
    }

    const stepsDiv = document.getElementById('event-steps');
    const resultDiv = document.getElementById('event-result');
    stepsDiv.style.display = 'block';
    resultDiv.style.display = 'none';
    
    stepsDiv.innerHTML = '<h3><i class="fas fa-cog fa-spin"></i> Đang xử lý...</h3>';
    
    setTimeout(() => {
        let events, steps;
        
        switch(algorithm) {
            case 'pattern-based':
                ({events, steps} = patternBasedEventExtraction(text));
                break;
            case 'sequence-labeling':
                ({events, steps} = sequenceLabelingEventExtraction(text));
                break;
            case 'neural':
                ({events, steps} = neuralEventExtraction(text));
                break;
            case 'joint-model':
                ({events, steps} = jointModelEventExtraction(text));
                break;
        }
        
        displayEventSteps(steps, algorithm);
        displayEvents(events);
    }, 500);
}

// Pattern-based Event Extraction
function patternBasedEventExtraction(text) {
    const steps = [];
    const events = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    steps.push({
        step: 1,
        title: 'Bước 1: Event Trigger Detection',
        description: 'Tìm các event triggers (động từ chỉ sự kiện)',
        data: ['Event triggers: công bố, ra mắt, mua lại, khởi động, thành lập...']
    });
    
    steps.push({
        step: 2,
        title: 'Bước 2: Pattern Matching',
        description: 'Áp dụng patterns để extract event arguments',
        data: []
    });
    
    sentences.forEach(sentence => {
        // ANNOUNCEMENT
        const annPattern = /([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\s+[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)\s+(?:đã\s+)?(công bố|ra mắt|giới thiệu)\s+([^vào]+?)\s+vào\s+(.+)/i;
        const annMatch = sentence.match(annPattern);
        if (annMatch) {
            const dateMatch = sentence.match(/(\d{1,2}\s*(?:tháng|ngày)\s*\d{1,2},?\s*\d{4}|\d{4})/i);
            events.push({
                organization: annMatch[1].trim(),
                eventType: 'ANNOUNCEMENT',
                product: annMatch[3].trim(),
                date: dateMatch ? dateMatch[1] : annMatch[4].trim(),
                location: sentence.match(/tại\s+([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)/i)?.[1] || 'N/A',
                sentence: sentence.trim(),
                confidence: 0.90
            });
            steps[1].data.push(`Pattern: [ORG] [TRIGGER] [PRODUCT] vào [DATE] → ANNOUNCEMENT`);
        }
        
        // ACQUISITION
        const acqPattern = /([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\s+[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)\s+(mua lại|mua)\s+([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\s+[A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)\s+(?:với giá|với|giá)\s+([^vào]+?)\s+vào\s+(.+)/i;
        const acqMatch = sentence.match(acqPattern);
        if (acqMatch) {
            events.push({
                organization: acqMatch[1].trim(),
                eventType: 'ACQUISITION',
                target: acqMatch[3].trim(),
                amount: acqMatch[4].trim(),
                date: acqMatch[5].trim(),
                sentence: sentence.trim(),
                confidence: 0.92
            });
            steps[1].data.push(`Pattern: [BUYER] [TRIGGER] [TARGET] với giá [AMOUNT] vào [DATE] → ACQUISITION`);
        }
    });
    
    return {events, steps};
}

// Sequence Labeling Event Extraction
function sequenceLabelingEventExtraction(text) {
    const steps = [];
    const events = [];
    
    steps.push({
        step: 1,
        title: 'Bước 1: BIO Tagging',
        description: 'Gán nhãn BIO cho mỗi token',
        data: ['B-TRIGGER: Beginning of trigger', 'I-TRIGGER: Inside trigger', 'B-ARG0: Beginning of argument 0', 'O: Outside']
    });
    
    steps.push({
        step: 2,
        title: 'Bước 2: Sequence Labeling Model',
        description: 'Sử dụng CRF/LSTM để dự đoán labels',
        data: []
    });
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    sentences.forEach(sentence => {
        const words = sentence.split(/\s+/);
        const tags = words.map((word, idx) => {
            if (/công bố|ra mắt|giới thiệu/i.test(word)) return 'B-TRIGGER';
            if (/mua lại|mua/i.test(word)) return 'B-TRIGGER';
            if (/^[A-ZĐ]/.test(word) && idx < 3) return 'B-ARG0';
            return 'O';
        });
        
        steps[1].data.push(`Tags: ${words.slice(0, 5).map((w, i) => `${w}/${tags[i]}`).join(' ')}...`);
        
        // Extract event from tags
        if (tags.includes('B-TRIGGER')) {
            const triggerIdx = tags.indexOf('B-TRIGGER');
            const orgIdx = tags.indexOf('B-ARG0');
            if (orgIdx !== -1 && triggerIdx !== -1) {
                if (/công bố|ra mắt/i.test(sentence)) {
                    events.push({
                        organization: words[orgIdx],
                        eventType: 'ANNOUNCEMENT',
                        product: words[triggerIdx + 1] || 'N/A',
                        date: sentence.match(/\d{4}/)?.[0] || 'N/A',
                        location: 'N/A',
                        sentence: sentence.trim(),
                        confidence: 0.85
                    });
                }
            }
        }
    });
    
    return {events, steps};
}

// Neural Event Extraction
function neuralEventExtraction(text) {
    const steps = [];
    const events = [];
    
    steps.push({
        step: 1,
        title: 'Bước 1: Event Trigger Classification',
        description: 'CNN/LSTM để phân loại event triggers',
        data: ['Input: word embeddings + context', 'Output: event type (ANNOUNCEMENT, ACQUISITION, ...)']
    });
    
    steps.push({
        step: 2,
        title: 'Bước 2: Argument Extraction',
        description: 'Extract event arguments (who, what, when, where)',
        data: ['Model: Attention mechanism', 'Extract: ARG0 (agent), ARG1 (theme), ARG-TMP (time), ARG-LOC (location)']
    });
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    sentences.forEach(sentence => {
        if (/công bố|ra mắt/i.test(sentence)) {
            const match = sentence.match(/([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)\s+(?:đã\s+)?(?:công bố|ra mắt)\s+([^vào]+)/i);
            if (match) {
                events.push({
                    organization: match[1],
                    eventType: 'ANNOUNCEMENT',
                    product: match[2].trim(),
                    date: sentence.match(/\d{4}/)?.[0] || 'N/A',
                    location: 'N/A',
                    sentence: sentence.trim(),
                    confidence: 0.88
                });
                steps[1].data.push(`Trigger: "công bố" → ARG0: "${match[1]}" → ARG1: "${match[2]}"`);
            }
        }
    });
    
    return {events, steps};
}

// Joint Model Event Extraction
function jointModelEventExtraction(text) {
    const steps = [];
    const events = [];
    
    steps.push({
        step: 1,
        title: 'Bước 1: Joint Learning',
        description: 'Học đồng thời event detection và argument extraction',
        data: ['Shared representation: BERT encoder', 'Task 1: Event trigger detection', 'Task 2: Argument role labeling']
    });
    
    steps.push({
        step: 2,
        title: 'Bước 2: Multi-task Learning',
        description: 'Tối ưu hóa loss function kết hợp',
        data: ['Loss = α * L_trigger + β * L_argument', 'α, β: hyperparameters để cân bằng 2 tasks']
    });
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    sentences.forEach(sentence => {
        if (/công bố|ra mắt/i.test(sentence)) {
            const match = sentence.match(/([A-ZĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)\s+(?:đã\s+)?(?:công bố|ra mắt)\s+([^vào]+)/i);
            if (match) {
                events.push({
                    organization: match[1],
                    eventType: 'ANNOUNCEMENT',
                    product: match[2].trim(),
                    date: sentence.match(/\d{4}/)?.[0] || 'N/A',
                    location: 'N/A',
                    sentence: sentence.trim(),
                    confidence: 0.90
                });
                steps[1].data.push(`Joint prediction: Trigger="công bố", ARG0="${match[1]}", ARG1="${match[2]}"`);
            }
        }
    });
    
    return {events, steps};
}

function displayEventSteps(steps, algorithm) {
    const stepsDiv = document.getElementById('event-steps');
    const algorithmNames = {
        'pattern-based': 'Pattern-based (Rule-based)',
        'sequence-labeling': 'Sequence Labeling (BIO)',
        'neural': 'Neural Networks',
        'joint-model': 'Joint Model'
    };
    
    let html = `<h3><i class="fas fa-list-ol"></i> Các bước xử lý - ${algorithmNames[algorithm]}</h3>`;
    
    steps.forEach(step => {
        html += `<div class="step-box">
            <h4 style="color: #667eea; margin-bottom: 10px;">
                <i class="fas fa-step-forward"></i> ${step.title}
            </h4>
            <p style="color: #666; margin-bottom: 10px;">${step.description}</p>`;
        
        if (step.data && step.data.length > 0) {
            html += '<div class="algorithm-step">';
            step.data.forEach((item, idx) => {
                html += `<div style="margin: 5px 0;">${item}</div>`;
            });
            html += '</div>';
        }
        
        html += '</div>';
    });
    
    stepsDiv.innerHTML = html;
}

function displayEvents(events) {
    const resultDiv = document.getElementById('event-result');
    resultDiv.style.display = 'block';
    
    if (events.length === 0) {
        resultDiv.innerHTML = '<div class="alert alert-info">Không tìm thấy sự kiện nào trong văn bản.</div>';
        return;
    }

    let html = '<h3><i class="fas fa-calendar-alt"></i> Các sự kiện được trích xuất:</h3>';
    
    events.forEach((event, index) => {
        const confidenceColor = event.confidence >= 0.9 ? '#4caf50' : event.confidence >= 0.8 ? '#ff9800' : '#f44336';
        
        html += `<div class="result-item" style="margin-bottom: 15px; border-left: 4px solid ${confidenceColor}; padding-left: 15px;">
            <h4 style="color: #667eea; margin-bottom: 10px;">
                Sự kiện ${index + 1}: ${event.eventType === 'ANNOUNCEMENT' ? 'Công bố' : event.eventType === 'ACQUISITION' ? 'Mua lại' : 'Khởi động'}
                <span style="font-size: 0.8em; color: ${confidenceColor}; margin-left: 10px;">(${(event.confidence * 100).toFixed(0)}% confidence)</span>
            </h4>`;
        
        if (event.eventType === 'ANNOUNCEMENT') {
            html += `<p><strong>Tổ chức:</strong> <span style="color: #667eea;">${event.organization}</span></p>
                     <p><strong>Sản phẩm:</strong> ${event.product}</p>
                     <p><strong>Ngày:</strong> <span style="color: #764ba2;">${event.date}</span></p>
                     <p><strong>Địa điểm:</strong> ${event.location}</p>`;
        } else if (event.eventType === 'ACQUISITION') {
            html += `<p><strong>Bên mua:</strong> <span style="color: #667eea;">${event.organization}</span></p>
                     <p><strong>Bên được mua:</strong> <span style="color: #667eea;">${event.target}</span></p>
                     <p><strong>Giá trị:</strong> <span style="color: #4caf50; font-weight: bold;">${event.amount}</span></p>
                     <p><strong>Ngày:</strong> <span style="color: #764ba2;">${event.date}</span></p>`;
        } else if (event.eventType === 'LAUNCH') {
            html += `<p><strong>Tổ chức:</strong> <span style="color: #667eea;">${event.organization}</span></p>
                     <p><strong>Sản phẩm:</strong> ${event.product}</p>
                     <p><strong>Ngày:</strong> <span style="color: #764ba2;">${event.date}</span></p>`;
        }
        
        html += `<p style="margin-top: 10px; font-style: italic; color: #666; font-size: 0.9em;">Câu gốc: ${event.sentence}</p>
                 </div>`;
    });

    resultDiv.innerHTML = html;
}
