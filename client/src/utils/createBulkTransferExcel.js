import Exceljs from "exceljs";

const bankCodes = {
    '산업': '02',
    '신한': '88',
    '기업': '03',
    '국민': '04',
    '외환': '05',
    '주택': '06',
    '수협': '07',
    '농협': '11',
    '농협회원': '12',
    '우리': '20',
    '서울': '25',
    '씨티': '27',
    '아이엠뱅크(대구은행)': '31',
    '부산': '32',
    '광주': '34',
    '제주': '35',
    '전북': '37',
    '경남': '39',
    '새마을': '45',
    '신협': '48',
    '상호저축': '50',
    '도이치': '55',
    '암로': '56',
    '우체국': '71',
    '하나': '81',
    '평화': '83',
    'HSBC': '54',
    'SC': '23',
    '구조흥': '21',
    '구신한': '26',
    '지역농.축협': '012',
    '케이뱅크': '089',
    '카카오뱅크': '090',
    '토스뱅크': '092',
    'BOA': '060',
    '산림조합': '064',
};

// Levenshtein 거리 계산 함수
function levenshteinDistance(a, b) {
    const dp = Array.from({ length: a.length + 1 }, () => []);
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
    }

    return dp[a.length][b.length];
}

// 가장 유사한 은행명 찾기 함수
function findClosestBankName(inputBankName) {
    let closestBankName = null;
    let minDistance = Infinity;

    for (const bankName in bankCodes) {
        const distance = levenshteinDistance(inputBankName, bankName);
        if (distance < minDistance) {
            minDistance = distance;
            closestBankName = bankName;
        }
    }

    return closestBankName;
}

// 주어진 문자열을 처리하는 함수
function parseAccountInfo(info) {
    const parts = info.split(' ');  // 띄어쓰기로 분리

    const inputBankName = parts[0];
    const accountNumber = parts[1].replace(/[^0-9]/g, '');  // 숫자만 남김
    const holderName = parts[2];

    const closestBankName = findClosestBankName(inputBankName);
    const bankCode = bankCodes[closestBankName] || 'Unknown';  // 은행 코드 찾기

    return {
        bankCode: bankCode,
        accountNumber: accountNumber,
        holderName: holderName
    };
}

const createBulkTransferExcel = async (authorSums, quarter) => {
    const workbook = new Exceljs.Workbook();
    const worksheet = workbook.addWorksheet('입력정보');

    //1행 ~ 12행. 별도 관리 필요한 행은 아래에
    authorSums.forEach((authorSum) => {
        const author = authorSum.author;
        const rawAccountNumber = author.accountNumber;
        if (rawAccountNumber !== undefined) {
            const parsedAccountNumber= parseAccountInfo(rawAccountNumber);
            const bankCode = parsedAccountNumber.bankCode;
            const accountNumber = parsedAccountNumber.accountNumber;
            const sumPaper = authorSum.sumPaper ? authorSum.sumPaper.value : 0;
            const sumEBook = authorSum.sumEBook ? authorSum.sumEBook.value : 0;
            if (sumPaper > 0) worksheet.addRow([bankCode, accountNumber, "", sumPaper, `${author.name}종이인세`, `${quarter}종이인세`, "", "", ""]);
            if (sumEBook > 0) worksheet.addRow([bankCode, accountNumber, "", sumEBook, `${author.name}전자인세`, `${quarter}전자인세`, "", "", ""]);
        }
    })
    // 엑셀 파일 생성
    return await workbook.xlsx.writeBuffer()
    // 파일 다운로드
    // const blob = new Blob([buffer], {type: 'application/octet-stream'});
    // saveAs(blob, `${author.name} ${quarter}분기 종이책 인세.xlsx`);
};
export default createBulkTransferExcel;