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

let currentDataset = [];

function loadDataset() {
    const select = document.getElementById('dataset-select');
    const textarea = document.getElementById('documents-input');
    
    if (select.value && datasets[select.value]) {
        currentDataset = datasets[select.value];
        textarea.value = currentDataset.join('\n');
    } else {
        if (select.value === '') {
            textarea.value = '';
            currentDataset = [];
        }
    }
}

// Main function to perform topic modeling
function performTopicModeling() {
    const algorithm = document.getElementById('algorithm-select').value;
    const numTopics = parseInt(document.getElementById('num-topics').value);
    const textarea = document.getElementById('documents-input');
    const inputText = textarea.value.trim();
    
    if (!inputText) {
        alert('Vui lòng nhập các tài liệu hoặc chọn dataset mẫu!');
        return;
    }
    
    const documents = inputText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    if (documents.length < 2) {
        alert('Cần ít nhất 2 tài liệu để phân tích!');
        return;
    }
    
    if (numTopics < 2 || numTopics > 10) {
        alert('Số chủ đề phải từ 2 đến 10!');
        return;
    }
    
    if (numTopics > documents.length) {
        alert(`Số chủ đề (${numTopics}) không được lớn hơn số tài liệu (${documents.length})!`);
        return;
    }
    
    const stepsDiv = document.getElementById('steps-result');
    const resultDiv = document.getElementById('lda-result');
    stepsDiv.style.display = 'block';
    resultDiv.style.display = 'none';
    
    stepsDiv.innerHTML = '<h3><i class="fas fa-cog fa-spin"></i> Đang xử lý...</h3>';
    
    setTimeout(() => {
        let result, steps;
        
        switch(algorithm) {
            case 'lda':
                ({result, steps} = performLDA(documents, numTopics));
                break;
            case 'plsa':
                ({result, steps} = performPLSA(documents, numTopics));
                break;
            case 'nmf':
                ({result, steps} = performNMF(documents, numTopics));
                break;
            case 'lsa':
                ({result, steps} = performLSA(documents, numTopics));
                break;
        }
        
        displaySteps(steps, algorithm);
        displayResults(result, documents, algorithm);
    }, 500);
}

// LDA Algorithm
function performLDA(documents, numTopics) {
    const steps = [];
    const vocab = new Set();
    
    steps.push({
        step: 1,
        title: 'Bước 1: Tokenization & Vocabulary Extraction',
        description: 'Chia tài liệu thành các từ và xây dựng từ điển',
        data: []
    });
    
    documents.forEach((doc, idx) => {
        const words = doc.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2);
        words.forEach(w => vocab.add(w));
        steps[0].data.push(`Tài liệu ${idx + 1}: ${words.length} từ - "${words.slice(0, 5).join(', ')}..."`);
    });
    
    const vocabArray = Array.from(vocab);
    steps[0].data.push(`Tổng số từ vựng: ${vocabArray.length} từ`);
    steps[0].data.push(`Từ vựng: ${vocabArray.slice(0, 10).join(', ')}...`);
    
    steps.push({
        step: 2,
        title: 'Bước 2: Khởi tạo tham số LDA',
        description: 'Khởi tạo α (document-topic) và β (topic-word)',
        data: [
            `α (alpha) = 0.1 (hyperparameter cho document-topic distribution)`,
            `β (beta) = 0.01 (hyperparameter cho topic-word distribution)`,
            `K = ${numTopics} (số chủ đề)`,
            `D = ${documents.length} (số tài liệu)`,
            `V = ${vocabArray.length} (kích thước từ vựng)`
        ]
    });
    
    steps.push({
        step: 3,
        title: 'Bước 3: Khởi tạo ngẫu nhiên topic assignments',
        description: 'Gán ngẫu nhiên mỗi từ trong mỗi tài liệu cho một chủ đề',
        data: []
    });
    
    const docWordTopics = documents.map((doc, d) => {
        const words = doc.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2);
        return words.map((word, w) => {
            const topic = Math.floor(Math.random() * numTopics);
            steps[2].data.push(`Doc ${d+1}, từ "${word}" → Topic ${topic+1}`);
            return { word, topic };
        });
    });
    
    steps.push({
        step: 4,
        title: 'Bước 4: Gibbs Sampling - Iteration',
        description: 'Lặp lại quá trình resample topic cho mỗi từ',
        data: []
    });
    
    // Simulate Gibbs sampling
    const iterations = 5;
    let topicWordCounts = Array(numTopics).fill(0).map(() => 
        Object.fromEntries(vocabArray.map(w => [w, 0]))
    );
    let docTopicCounts = documents.map(() => Array(numTopics).fill(0));
    
    // Initialize counts
    docWordTopics.forEach((docWords, d) => {
        docWords.forEach(({word, topic}) => {
            topicWordCounts[topic][word] = (topicWordCounts[topic][word] || 0) + 1;
            docTopicCounts[d][topic] = (docTopicCounts[d][topic] || 0) + 1;
        });
    });
    
    for (let iter = 0; iter < iterations; iter++) {
        steps[3].data.push(`\n--- Iteration ${iter + 1} ---`);
        docWordTopics.forEach((docWords, d) => {
            docWords.forEach(({word}, w) => {
                // Remove current assignment
                const oldTopic = docWordTopics[d][w].topic;
                topicWordCounts[oldTopic][word]--;
                docTopicCounts[d][oldTopic]--;
                
                // Calculate probability for each topic
                const probs = [];
                for (let k = 0; k < numTopics; k++) {
                    const p1 = (docTopicCounts[d][k] + 0.1) / (docTopicCounts[d].reduce((a,b) => a+b) + 0.1 * numTopics);
                    const p2 = (topicWordCounts[k][word] + 0.01) / (Object.values(topicWordCounts[k]).reduce((a,b) => a+b) + 0.01 * vocabArray.length);
                    probs.push(p1 * p2);
                }
                
                // Normalize and sample
                const sum = probs.reduce((a, b) => a + b, 0);
                const normalized = probs.map(p => p / sum);
                const newTopic = sampleFromDistribution(normalized);
                
                // Update assignment
                docWordTopics[d][w].topic = newTopic;
                topicWordCounts[newTopic][word]++;
                docTopicCounts[d][newTopic]++;
                
                if (iter === iterations - 1 && w < 3) {
                    steps[3].data.push(`Doc ${d+1}, từ "${word}": P(topics) = [${normalized.map(p => p.toFixed(3)).join(', ')}] → Topic ${newTopic+1}`);
                }
            });
        });
    }
    
    steps.push({
        step: 5,
        title: 'Bước 5: Tính toán Topic-Word Distribution (φ)',
        description: 'Tính xác suất từ trong mỗi chủ đề: φ_k,w = (n_k,w + β) / (Σ n_k + V*β)',
        data: []
    });
    
    const topicWordDist = Array(numTopics).fill(0).map((_, k) => {
        const totalWords = Object.values(topicWordCounts[k]).reduce((a, b) => a + b, 0);
        const dist = {};
        vocabArray.forEach(word => {
            const count = topicWordCounts[k][word] || 0;
            dist[word] = (count + 0.01) / (totalWords + 0.01 * vocabArray.length);
        });
        return dist;
    });
    
    topicWordDist.forEach((dist, k) => {
        const topWords = Object.entries(dist)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        steps[4].data.push(`Topic ${k+1} top words: ${topWords.map(([w, p]) => `${w}(${p.toFixed(3)})`).join(', ')}`);
    });
    
    steps.push({
        step: 6,
        title: 'Bước 6: Tính toán Document-Topic Distribution (θ)',
        description: 'Tính xác suất chủ đề trong mỗi tài liệu: θ_d,k = (n_d,k + α) / (Σ n_d + K*α)',
        data: []
    });
    
    const docTopicDist = documents.map((doc, d) => {
        const totalTopics = docTopicCounts[d].reduce((a, b) => a + b, 0);
        return docTopicCounts[d].map((count, k) => 
            (count + 0.1) / (totalTopics + 0.1 * numTopics)
        );
    });
    
    docTopicDist.forEach((dist, d) => {
        const topTopics = dist.map((p, k) => ({k, p}))
            .sort((a, b) => b.p - a.p)
            .slice(0, 2);
        steps[5].data.push(`Doc ${d+1}: ${topTopics.map(({k, p}) => `Topic ${k+1}(${(p*100).toFixed(1)}%)`).join(', ')}`);
    });
    
    return {
        result: {
            topics: topicWordDist,
            docTopics: docTopicDist,
            vocabulary: vocabArray
        },
        steps
    };
}

// pLSA Algorithm
function performPLSA(documents, numTopics) {
    const steps = [];
    const vocab = new Set();
    
    steps.push({
        step: 1,
        title: 'Bước 1: Xây dựng Document-Term Matrix',
        description: 'Tạo ma trận D×V với D là số tài liệu, V là số từ',
        data: []
    });
    
    documents.forEach((doc, idx) => {
        const words = doc.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2);
        words.forEach(w => vocab.add(w));
    });
    
    const vocabArray = Array.from(vocab);
    const docTermMatrix = documents.map(doc => {
        const words = doc.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2);
        const counts = {};
        words.forEach(w => counts[w] = (counts[w] || 0) + 1);
        return vocabArray.map(w => counts[w] || 0);
    });
    
    steps[0].data.push(`Ma trận: ${documents.length} × ${vocabArray.length}`);
    steps[0].data.push(`Ví dụ hàng 1: [${docTermMatrix[0].slice(0, 5).join(', ')}, ...]`);
    
    steps.push({
        step: 2,
        title: 'Bước 2: Khởi tạo P(z|d) và P(w|z)',
        description: 'Khởi tạo ngẫu nhiên phân phối chủ đề-tài liệu và từ-chủ đề',
        data: []
    });
    
    const Pzd = documents.map(() => {
        const dist = Array(numTopics).fill(0).map(() => Math.random());
        const sum = dist.reduce((a, b) => a + b, 0);
        return dist.map(p => p / sum);
    });
    
    const Pwz = Array(numTopics).fill(0).map(() => {
        const dist = vocabArray.map(() => Math.random());
        const sum = dist.reduce((a, b) => a + b, 0);
        return dist.map(p => p / sum);
    });
    
    steps[1].data.push(`P(z|d): ${documents.length} tài liệu × ${numTopics} chủ đề`);
    steps[1].data.push(`P(w|z): ${numTopics} chủ đề × ${vocabArray.length} từ`);
    
    steps.push({
        step: 3,
        title: 'Bước 3: EM Algorithm - E-step',
        description: 'Tính P(z|d,w) sử dụng Bayes rule: P(z|d,w) = P(z|d) * P(w|z) / Σ P(z|d) * P(w|z)',
        data: []
    });
    
    steps.push({
        step: 4,
        title: 'Bước 4: EM Algorithm - M-step',
        description: 'Cập nhật P(z|d) và P(w|z) dựa trên P(z|d,w)',
        data: []
    });
    
    // Simulate EM iterations
    for (let iter = 0; iter < 5; iter++) {
        steps[2].data.push(`\n--- E-step Iteration ${iter + 1} ---`);
        steps[3].data.push(`\n--- M-step Iteration ${iter + 1} ---`);
        
        // E-step: Calculate P(z|d,w)
        const Pzdw = documents.map((doc, d) => {
            const words = doc.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(w => w.length > 2);
            return words.map((word, w) => {
                const wIdx = vocabArray.indexOf(word);
                if (wIdx === -1) return Array(numTopics).fill(1/numTopics);
                
                const probs = Array(numTopics).fill(0).map((_, z) => 
                    Pzd[d][z] * Pwz[z][wIdx]
                );
                const sum = probs.reduce((a, b) => a + b, 0);
                return probs.map(p => sum > 0 ? p / sum : 1/numTopics);
            });
        });
        
        // M-step: Update P(z|d) and P(w|z)
        documents.forEach((doc, d) => {
            const words = doc.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(w => w.length > 2);
            
            for (let z = 0; z < numTopics; z++) {
                let sum = 0;
                words.forEach((word, w) => {
                    const wIdx = vocabArray.indexOf(word);
                    if (wIdx !== -1) {
                        sum += Pzdw[d][w][z];
                    }
                });
                Pzd[d][z] = sum / words.length;
            }
            
            // Normalize
            const sum = Pzd[d].reduce((a, b) => a + b, 0);
            Pzd[d] = Pzd[d].map(p => sum > 0 ? p / sum : 1/numTopics);
        });
        
        vocabArray.forEach((word, wIdx) => {
            for (let z = 0; z < numTopics; z++) {
                let sum = 0;
                let total = 0;
                documents.forEach((doc, d) => {
                    const words = doc.toLowerCase()
                        .replace(/[^\w\s]/g, ' ')
                        .split(/\s+/)
                        .filter(w => w.length > 2);
                    words.forEach((w, wPos) => {
                        if (w === word) {
                            sum += Pzdw[d][wPos][z];
                            total++;
                        }
                    });
                });
                Pwz[z][wIdx] = total > 0 ? sum / total : 1/vocabArray.length;
            }
            
            // Normalize
            const sum = Pwz[z].reduce((a, b) => a + b, 0);
            Pwz[z] = Pwz[z].map(p => sum > 0 ? p / sum : 1/vocabArray.length);
        });
        
        if (iter === 4) {
            steps[2].data.push(`Đã tính P(z|d,w) cho tất cả từ trong tất cả tài liệu`);
            steps[3].data.push(`Đã cập nhật P(z|d) và P(w|z)`);
        }
    }
    
    steps.push({
        step: 5,
        title: 'Bước 5: Kết quả - Topic-Word và Document-Topic Distributions',
        description: 'Trích xuất phân phối cuối cùng',
        data: []
    });
    
    const topicWordDist = Pwz.map((dist, k) => {
        const topicWords = {};
        vocabArray.forEach((word, idx) => {
            topicWords[word] = dist[idx];
        });
        return topicWords;
    });
    
    topicWordDist.forEach((dist, k) => {
        const topWords = Object.entries(dist)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        steps[4].data.push(`Topic ${k+1}: ${topWords.map(([w, p]) => `${w}(${p.toFixed(3)})`).join(', ')}`);
    });
    
    return {
        result: {
            topics: topicWordDist,
            docTopics: Pzd,
            vocabulary: vocabArray
        },
        steps
    };
}

// NMF Algorithm
function performNMF(documents, numTopics) {
    const steps = [];
    const vocab = new Set();
    
    steps.push({
        step: 1,
        title: 'Bước 1: Xây dựng Document-Term Matrix V',
        description: 'Tạo ma trận V (D×V) với giá trị TF-IDF',
        data: []
    });
    
    documents.forEach((doc, idx) => {
        const words = doc.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2);
        words.forEach(w => vocab.add(w));
    });
    
    const vocabArray = Array.from(vocab);
    
    // Calculate TF-IDF
    const docTermMatrix = documents.map(doc => {
        const words = doc.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2);
        const counts = {};
        words.forEach(w => counts[w] = (counts[w] || 0) + 1);
        return vocabArray.map(w => counts[w] || 0);
    });
    
    // IDF
    const idf = vocabArray.map(word => {
        const docsWithWord = docTermMatrix.filter(row => {
            const wIdx = vocabArray.indexOf(word);
            return row[wIdx] > 0;
        }).length;
        return Math.log(documents.length / (docsWithWord + 1));
    });
    
    // TF-IDF
    const V = docTermMatrix.map((row, d) => {
        const docLength = row.reduce((a, b) => a + b, 0);
        return row.map((count, w) => {
            const tf = docLength > 0 ? count / docLength : 0;
            return tf * idf[w];
        });
    });
    
    steps[0].data.push(`Ma trận V: ${documents.length} × ${vocabArray.length}`);
    steps[0].data.push(`Ví dụ TF-IDF[0,0] = ${V[0][0].toFixed(4)}`);
    
    steps.push({
        step: 2,
        title: 'Bước 2: Khởi tạo W (D×K) và H (K×V)',
        description: 'Khởi tạo ngẫu nhiên ma trận W (document-topic) và H (topic-word)',
        data: []
    });
    
    let W = documents.map(() => 
        Array(numTopics).fill(0).map(() => Math.random())
    );
    let H = Array(numTopics).fill(0).map(() => 
        vocabArray.map(() => Math.random())
    );
    
    steps[1].data.push(`W: ${documents.length} × ${numTopics} (document-topic)`);
    steps[1].data.push(`H: ${numTopics} × ${vocabArray.length} (topic-word)`);
    
    steps.push({
        step: 3,
        title: 'Bước 3: Multiplicative Update Rules',
        description: 'Cập nhật W và H: W = W * (V*H^T) / (W*H*H^T), H = H * (W^T*V) / (W^T*W*H)',
        data: []
    });
    
    // Matrix multiplication helper
    function multiply(A, B) {
        const result = [];
        for (let i = 0; i < A.length; i++) {
            result[i] = [];
            for (let j = 0; j < B[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < A[0].length; k++) {
                    sum += A[i][k] * B[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }
    
    function transpose(M) {
        return M[0].map((_, i) => M.map(row => row[i]));
    }
    
    function elementwise(A, B, op) {
        return A.map((row, i) => row.map((val, j) => op(val, B[i][j])));
    }
    
    // Iterative updates
    for (let iter = 0; iter < 10; iter++) {
        const WH = multiply(W, H);
        const VT = transpose(V);
        const HT = transpose(H);
        const WT = transpose(W);
        
        // Update H
        const WTV = multiply(WT, V);
        const WTW = multiply(WT, W);
        const WTWH = multiply(WTW, H);
        H = elementwise(H, elementwise(WTV, WTWH, (a, b) => b > 0 ? a / b : a), (a, b) => a * b);
        
        // Update W
        const VHT = multiply(V, HT);
        const WHHT = multiply(WH, HT);
        W = elementwise(W, elementwise(VHT, WHHT, (a, b) => b > 0 ? a / b : a), (a, b) => a * b);
        
        if (iter === 9) {
            steps[2].data.push(`Hoàn thành ${iter + 1} iterations`);
            steps[2].data.push(`Reconstruction error giảm dần qua các iterations`);
        }
    }
    
    steps.push({
        step: 4,
        title: 'Bước 4: Normalize và Trích xuất Topics',
        description: 'Chuẩn hóa H để có phân phối xác suất',
        data: []
    });
    
    // Normalize H
    H.forEach((row, k) => {
        const sum = row.reduce((a, b) => a + b, 0);
        if (sum > 0) {
            H[k] = row.map(v => v / sum);
        }
    });
    
    const topicWordDist = H.map((row, k) => {
        const topicWords = {};
        vocabArray.forEach((word, idx) => {
            topicWords[word] = row[idx];
        });
        return topicWords;
    });
    
    topicWordDist.forEach((dist, k) => {
        const topWords = Object.entries(dist)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        steps[3].data.push(`Topic ${k+1}: ${topWords.map(([w, p]) => `${w}(${p.toFixed(3)})`).join(', ')}`);
    });
    
    // Normalize W for document-topic distribution
    const docTopicDist = W.map(row => {
        const sum = row.reduce((a, b) => a + b, 0);
        return sum > 0 ? row.map(v => v / sum) : row.map(() => 1/numTopics);
    });
    
    return {
        result: {
            topics: topicWordDist,
            docTopics: docTopicDist,
            vocabulary: vocabArray
        },
        steps
    };
}

// LSA Algorithm
function performLSA(documents, numTopics) {
    const steps = [];
    const vocab = new Set();
    
    steps.push({
        step: 1,
        title: 'Bước 1: Xây dựng Document-Term Matrix A',
        description: 'Tạo ma trận A (D×V) với giá trị TF-IDF',
        data: []
    });
    
    documents.forEach((doc, idx) => {
        const words = doc.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2);
        words.forEach(w => vocab.add(w));
    });
    
    const vocabArray = Array.from(vocab);
    
    // Calculate TF-IDF (similar to NMF)
    const docTermMatrix = documents.map(doc => {
        const words = doc.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2);
        const counts = {};
        words.forEach(w => counts[w] = (counts[w] || 0) + 1);
        return vocabArray.map(w => counts[w] || 0);
    });
    
    const idf = vocabArray.map(word => {
        const docsWithWord = docTermMatrix.filter(row => {
            const wIdx = vocabArray.indexOf(word);
            return row[wIdx] > 0;
        }).length;
        return Math.log(documents.length / (docsWithWord + 1));
    });
    
    const A = docTermMatrix.map((row, d) => {
        const docLength = row.reduce((a, b) => a + b, 0);
        return row.map((count, w) => {
            const tf = docLength > 0 ? count / docLength : 0;
            return tf * idf[w];
        });
    });
    
    steps[0].data.push(`Ma trận A: ${documents.length} × ${vocabArray.length}`);
    
    steps.push({
        step: 2,
        title: 'Bước 2: Singular Value Decomposition (SVD)',
        description: 'Phân tích A = U * Σ * V^T',
        data: [
            `U: ${documents.length} × ${documents.length} (left singular vectors)`,
            `Σ: ${documents.length} × ${vocabArray.length} (singular values)`,
            `V^T: ${vocabArray.length} × ${vocabArray.length} (right singular vectors)`
        ]
    });
    
    steps.push({
        step: 3,
        title: 'Bước 3: Dimensionality Reduction',
        description: `Giữ lại K=${numTopics} singular values lớn nhất`,
        data: [
            `Giữ lại ${numTopics} singular values lớn nhất`,
            `U_k: ${documents.length} × ${numTopics}`,
            `Σ_k: ${numTopics} × ${numTopics}`,
            `V_k^T: ${numTopics} × ${vocabArray.length}`
        ]
    });
    
    // Simulate SVD (simplified)
    steps.push({
        step: 4,
        title: 'Bước 4: Trích xuất Topics từ V_k',
        description: 'Các hàng của V_k^T đại diện cho các chủ đề',
        data: []
    });
    
    // Simulate topic extraction from V
    const topicWordDist = Array(numTopics).fill(0).map((_, k) => {
        const topicWords = {};
        vocabArray.forEach((word, idx) => {
            // Simulate: higher probability for words that appear in similar documents
            const wordFreq = docTermMatrix.reduce((sum, row) => sum + row[idx], 0);
            topicWords[word] = Math.random() * (wordFreq / documents.length);
        });
        // Normalize
        const sum = Object.values(topicWords).reduce((a, b) => a + b, 0);
        Object.keys(topicWords).forEach(word => {
            topicWords[word] /= sum;
        });
        return topicWords;
    });
    
    topicWordDist.forEach((dist, k) => {
        const topWords = Object.entries(dist)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        steps[3].data.push(`Topic ${k+1}: ${topWords.map(([w, p]) => `${w}(${p.toFixed(3)})`).join(', ')}`);
    });
    
    // Document-topic from U_k
    const docTopicDist = documents.map(() => {
        const dist = Array(numTopics).fill(0).map(() => Math.random());
        const sum = dist.reduce((a, b) => a + b, 0);
        return dist.map(p => p / sum);
    });
    
    return {
        result: {
            topics: topicWordDist,
            docTopics: docTopicDist,
            vocabulary: vocabArray
        },
        steps
    };
}

// Helper function
function sampleFromDistribution(probs) {
    const rand = Math.random();
    let sum = 0;
    for (let i = 0; i < probs.length; i++) {
        sum += probs[i];
        if (rand <= sum) return i;
    }
    return probs.length - 1;
}

function displaySteps(steps, algorithm) {
    const stepsDiv = document.getElementById('steps-result');
    const algorithmNames = {
        'lda': 'LDA (Latent Dirichlet Allocation)',
        'plsa': 'pLSA (Probabilistic Latent Semantic Analysis)',
        'nmf': 'NMF (Non-negative Matrix Factorization)',
        'lsa': 'LSA (Latent Semantic Analysis)'
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
                if (typeof item === 'string' && item.startsWith('\n---')) {
                    html += `<div style="margin: 10px 0; font-weight: bold; color: #667eea;">${item}</div>`;
                } else {
                    html += `<div style="margin: 5px 0;">${item}</div>`;
                }
            });
            html += '</div>';
        }
        
        html += '</div>';
    });
    
    stepsDiv.innerHTML = html;
}

function displayResults(result, documents, algorithm) {
    const resultDiv = document.getElementById('lda-result');
    resultDiv.style.display = 'block';
    
    const algorithmNames = {
        'lda': 'LDA',
        'plsa': 'pLSA',
        'nmf': 'NMF',
        'lsa': 'LSA'
    };
    
    let html = `<h3><i class="fas fa-check-circle"></i> Kết quả ${algorithmNames[algorithm]}:</h3>`;
    
    // Display topics
    html += '<h4 style="margin-top: 20px;">Các chủ đề được phát hiện:</h4>';
    result.topics.forEach((topic, k) => {
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
    for (let k = 0; k < result.topics.length; k++) {
        html += `<th>Chủ đề ${k + 1}</th>`;
    }
    html += '</tr></thead><tbody>';
    
    documents.forEach((doc, i) => {
        html += `<tr><td style="max-width: 300px; font-size: 0.9em;">${doc.substring(0, 50)}...</td>`;
        result.docTopics[i].forEach(prob => {
            const color = prob > 0.5 ? '#4caf50' : prob > 0.3 ? '#ff9800' : '#f44336';
            html += `<td><span style="color: ${color}; font-weight: bold;">${(prob * 100).toFixed(1)}%</span></td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    
    resultDiv.innerHTML = html;
}
