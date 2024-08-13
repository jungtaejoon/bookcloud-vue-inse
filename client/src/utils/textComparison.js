function levenshtein(a, b) {
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    if (an === 0) {
        return bn;
    }
    if (bn === 0) {
        return an;
    }
    const matrix = Array(an + 1);
    for (let i = 0; i <= an; i++) {
        matrix[i] = Array(bn + 1).fill(0);
        matrix[i][0] = i;
    }
    for (let j = 0; j <= bn; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= an; i++) {
        for (let j = 1; j <= bn; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    return matrix[an][bn];
}

// 특정 글자수까지의 유사도를 계산하는 함수
function similarityByPrefix(text1, text2) {
    const prefixLength = Math.min(text1.length, text2.length);
    const prefix1 = text1.slice(0, prefixLength);
    const prefix2 = text2.slice(0, prefixLength);
    const distance = levenshtein(prefix1, prefix2);
    const maxLen = Math.max(prefix1.length, prefix2.length);
    const similarity = ((maxLen - distance) / maxLen) * 100;
    return similarity.toFixed(2);
}

export default similarityByPrefix;