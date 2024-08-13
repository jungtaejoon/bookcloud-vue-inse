import Exceljs from "exceljs";
import { ref } from "vue";
import { saveAs } from "file-saver";

const createExcelOfEbookRoyalties = async (author, quarter, authorRoyalties) => {
    async function loadImageAsBase64(imageUrl) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    const workbook = new Exceljs.Workbook();
    const worksheet = workbook.addWorksheet('전자책');
    worksheet.properties.defaultRowHeight = 23.25;
    worksheet.properties.defaultColWidth = 7.5;
    const titleRowHeight = 50;
    const emptyRowHeight = 7;

    const quarterStr = ref("");
    switch (quarter.slice(-1)) {
        case "1":
            quarterStr.value = `${quarter.slice(0, 4)}년 1분기(1월 1일 ~ 3월 31일)`;
            break;
        case "2":
            quarterStr.value = `${quarter.slice(0, 4)}년 2분기(4월 1일 ~ 6월 30일)`;
            break;
        case "3":
            quarterStr.value = `${quarter.slice(0, 4)}년 3분기(7월 1일 ~ 9월 30일)`;
            break;
        case "4":
            quarterStr.value = `${quarter.slice(0, 4)}년 4분기(10월 1일 ~ 12월 31일)`;
            break;
    }
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formattedDate = `${year}년 ${month}월 ${day}일`;
    const targetAuthorRoyalties = authorRoyalties.filter((authorRoyalty) => authorRoyalty.authorId === author.id);

    //1행 ~ 12행. 별도 관리 필요한 행은 아래에
    const row1 = worksheet.addRow(["인세 지급 명세서"]);
    worksheet.mergeCells('A1:L1');
    row1.height = titleRowHeight;
    row1.alignment = { vertical: 'middle', horizontal: 'center' };
    const cellA1L1 = worksheet.getCell("A1:L1");
    cellA1L1.border = { bottom: { style: "thin" } }
    worksheet.addRow([]).height = emptyRowHeight;
    worksheet.addRow([]);
    worksheet.addRow([]).height = emptyRowHeight;
    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([]).height = emptyRowHeight;
    worksheet.addRow(["1. 해당 분기 인세를 정산하오니 내역을 참고하시기 바랍니다."]);
    worksheet.mergeCells('A8:L8');
    worksheet.addRow([]).height = emptyRowHeight;
    worksheet.addRow(["2. 인세 산출 내역"]);
    worksheet.mergeCells('A10:L10');
    worksheet.addRow([]);
    worksheet.addRow([]);

    //3행
    const cellA3 = worksheet.getCell("A3");
    cellA3.value = "귀속분기:";
    cellA3.alignment = { vertical: 'middle', horizontal: 'center' };
    const cellB3 = worksheet.getCell("B3");
    cellB3.value = quarterStr.value;
    cellB3.alignment = { vertical: 'middle', horizontal: 'center' };
    const cellJ3 = worksheet.getCell("J3");
    cellJ3.value = "작성일:";
    cellJ3.alignment = { vertical: 'middle', horizontal: 'center' };
    const cellK3 = worksheet.getCell("K3");
    cellK3.value = formattedDate;
    cellK3.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.mergeCells('B3:F3');
    worksheet.mergeCells('K3:L3');

    //5행
    worksheet.getCell("A5").value = "저 자 명";
    worksheet.getCell("C5").value = author.name;
    worksheet.getCell("G5").value = "주민등록번호";
    worksheet.getCell("I5").value = author.idNumber;
    worksheet.mergeCells('A5:B5');
    worksheet.mergeCells('C5:F5');
    worksheet.mergeCells('G5:H5');
    worksheet.mergeCells('I5:L5');

    //6행
    worksheet.getCell("A6").value = "주 소";
    worksheet.getCell("C6").value = author.address;
    worksheet.getCell("G6").value = "계 좌 번 호";
    worksheet.getCell("I6").value = author.accountNumber;
    worksheet.mergeCells('A6:B6');
    worksheet.mergeCells('C6:F6');
    worksheet.mergeCells('G6:H6');
    worksheet.mergeCells('I6:L6');

    //5,6행 스타일
    const setBorder = (startCell, endCell) => {
        const borderStyle = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        };

        const startCol = startCell.charCodeAt(0);
        const startRow = parseInt(startCell.slice(1));
        const endCol = endCell.charCodeAt(0);
        const endRow = parseInt(endCell.slice(1));

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const cellAddress = String.fromCharCode(col) + row;
                const cell = worksheet.getCell(cellAddress);
                cell.border = borderStyle;
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
        }
    };
    setBorder("A5", "L6");

    //11행
    worksheet.getCell("A11").value = "도서명";
    worksheet.getCell("C11").value = "ISBN";
    worksheet.getCell("E11").value = "정가";
    worksheet.getCell("G11").value = "인세율(a)";
    worksheet.getCell("I11").value = "매출액(b)*";
    worksheet.getCell("K11").value = "인세(c)";
    worksheet.mergeCells('A11:B12');
    worksheet.mergeCells('C11:D12');
    worksheet.mergeCells('E11:F12');
    worksheet.mergeCells('G11:H12');
    worksheet.mergeCells('I11:J11');
    worksheet.mergeCells('K11:L11');

    //12행
    const cellI12 = worksheet.getCell("I12");
    cellI12.value = "*별첨1 참조"
    const cellK12 = worksheet.getCell("K12");
    cellK12.value = "a * b";
    setBorder("A11", "L12");
    cellI12.border = {
        top: { style: "dashed", color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
    };
    cellK12.border = {
        top: { style: "dashed", color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
    };
    cellI12.font = { color: { argb: 'FFE2E2E2' } };
    cellK12.font = { color: { argb: 'FFE2E2E2' } };
    worksheet.mergeCells('I12:J12');
    worksheet.mergeCells('K12:L12');

    //11, 12행 스타일 적용

    //13행부터 도서 목록
    targetAuthorRoyalties.forEach((authorRoyalty) => {
        const royalty = authorRoyalty.royalty;
        const targetBook = royalty.book;
        if (targetBook.isbnEBook) {
            const currentRow = worksheet.addRow([targetBook.title, "", targetBook.isbnEBook, "", parseInt(targetBook.priceEBook).toLocaleString(), "", `${royalty.royaltyRateEBook}%`, "", royalty.amount.toLocaleString(), "", royalty.royaltyEBook.toLocaleString()]);
            currentRow.eachCell(cell => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
            });
            worksheet.mergeCells(`A${currentRow.number}:B${currentRow.number}`);
            worksheet.mergeCells(`C${currentRow.number}:D${currentRow.number}`);
            worksheet.mergeCells(`E${currentRow.number}:F${currentRow.number}`);
            worksheet.mergeCells(`G${currentRow.number}:H${currentRow.number}`);
            worksheet.mergeCells(`I${currentRow.number}:J${currentRow.number}`);
            worksheet.mergeCells(`K${currentRow.number}:L${currentRow.number}`);
            worksheet.getCell(`A${currentRow.number}`).alignment = { vertical: 'middle', horizontal: 'left' };
            worksheet.getCell(`C${currentRow.number}`).alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.getCell(`E${currentRow.number}`).alignment = { vertical: 'middle', horizontal: 'right' };
            worksheet.getCell(`G${currentRow.number}`).alignment = { vertical: 'middle', horizontal: 'right' };
            worksheet.getCell(`I${currentRow.number}`).alignment = { vertical: 'middle', horizontal: 'right' };
            worksheet.getCell(`K${currentRow.number}`).alignment = { vertical: 'middle', horizontal: 'right' };
        }
    });

    //이후 빈행 하나
    worksheet.addRow([]).height = emptyRowHeight;

    //정산
    worksheet.addRow(["3. 정산"]);
    const settlementTitleRow = worksheet.addRow(["도서명", "", "ISBN", "", "소득세(d)", "", "지방소득세(e)", "", "선인세 및 기타(f)", "", "실수령액**"])
    const settlementTitleRow2 = worksheet.addRow(["", "", "", "", "c * 3%", "", "d * 10%", "", "*이월 금액 포함", "", "c - d - e - f"]);
    worksheet.mergeCells(`A${settlementTitleRow.number}:B${settlementTitleRow.number + 1}`);
    worksheet.mergeCells(`C${settlementTitleRow.number}:D${settlementTitleRow.number + 1}`);
    worksheet.mergeCells(`E${settlementTitleRow.number}:F${settlementTitleRow.number}`);
    worksheet.mergeCells(`G${settlementTitleRow.number}:H${settlementTitleRow.number}`);
    worksheet.mergeCells(`I${settlementTitleRow.number}:J${settlementTitleRow.number}`);
    worksheet.mergeCells(`K${settlementTitleRow.number}:L${settlementTitleRow.number}`);
    worksheet.mergeCells(`E${settlementTitleRow2.number}:F${settlementTitleRow2.number}`);
    worksheet.mergeCells(`G${settlementTitleRow2.number}:H${settlementTitleRow2.number}`);
    worksheet.mergeCells(`I${settlementTitleRow2.number}:J${settlementTitleRow2.number}`);
    worksheet.mergeCells(`K${settlementTitleRow2.number}:L${settlementTitleRow2.number}`);

    //정산 스타일 적용
    setBorder(`A${settlementTitleRow.number}`, `L${settlementTitleRow2.number}`);

    //정산 포문
    const sum = ref(0);
    targetAuthorRoyalties.forEach((authorRoyalty) => {
        const royalty = authorRoyalty.royalty;
        const targetBook = royalty.book;
        if (targetBook.isbnEBook) {
            const currentRow = worksheet.addRow([targetBook.title, "", targetBook.isbnEBook, "", royalty.royaltyEBookNationalTax.toLocaleString(), "", royalty.royaltyEBookCountryTax.toLocaleString(), "", authorRoyalty.balanceEBook.toLocaleString(), "", authorRoyalty.netPayEBook.toLocaleString()]);
            currentRow.eachCell(cell => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
            });
            worksheet.mergeCells(`A${currentRow.number}:B${currentRow.number}`);
            worksheet.mergeCells(`C${currentRow.number}:D${currentRow.number}`);
            worksheet.mergeCells(`E${currentRow.number}:F${currentRow.number}`);
            worksheet.mergeCells(`G${currentRow.number}:H${currentRow.number}`);
            worksheet.mergeCells(`I${currentRow.number}:J${currentRow.number}`);
            worksheet.mergeCells(`K${currentRow.number}:L${currentRow.number}`);
            sum.value += authorRoyalty.netPayEBook < 0 ? 0 : authorRoyalty.netPayEBook;
            worksheet.getCell(`A${currentRow.number}`).alignment = { vertical: 'middle', horizontal: 'left' };
            worksheet.getCell(`C${currentRow.number}`).alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.getCell(`E${currentRow.number}`).alignment = { vertical: 'middle', horizontal: 'right' };
            worksheet.getCell(`G${currentRow.number}`).alignment = { vertical: 'middle', horizontal: 'right' };
            worksheet.getCell(`I${currentRow.number}`).alignment = { vertical: 'middle', horizontal: 'right' };
            worksheet.getCell(`K${currentRow.number}`).alignment = { vertical: 'middle', horizontal: 'right' };
        }
    });

    //합계
    const sumRow = worksheet.addRow([]);
    const sumTitleCell = worksheet.getCell(`I${sumRow.number}`);
    sumTitleCell.value = "합계";
    const sumContentCell = worksheet.getCell(`K${sumRow.number}`);
    sumContentCell.value = `${sum.value.toLocaleString()}원`;
    worksheet.mergeCells(`I${sumRow.number}:J${sumRow.number}`);
    worksheet.mergeCells(`K${sumRow.number}:L${sumRow.number}`);

    //합계 스타일 적용
    sumTitleCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
    };
    sumTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sumContentCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
    };
    sumContentCell.alignment = { vertical: 'middle', horizontal: 'center' };

    //빈행
    worksheet.addRow([]).height = emptyRowHeight;

    //
    worksheet.addRow([`위와 같이 인세 지급액 합계 ${sum.value.toLocaleString()}원을 지급합니다.`]);

    //빈행
    worksheet.addRow([]).height = emptyRowHeight;

    //
    worksheet.addRow(["* 판매부수의 구체적인 사항은 별첨 자료을 참고하시기 바랍니다."]);
    const tempRow = worksheet.addRow(["** 선인세 및 기타 선지급금의 잔액이 정산 금액보다 큰 경우(실수령액 실제 결과 음수) 실수령액은 0원이며 선인세 및 기타 선지급금에서 차감 후 이월"]);
    worksheet.mergeCells(`A${tempRow.number}:L${tempRow.number}`);
    worksheet.getCell(`A${tempRow.number}`).alignment = { wrapText: true };
    tempRow.height = 28;

    //빈행
    worksheet.addRow([]).height = emptyRowHeight;

    //
    worksheet.addRow(["- 다른 문의사항은 아래로 연락 바랍니다."])

    //빈행
    worksheet.addRow([]).height = emptyRowHeight;

    //
    worksheet.addRow(["전화", "010-4455-0429"]);
    worksheet.addRow(["팩스", "0303-3440-0429"]);
    worksheet.addRow(["이메일", "jungtaejoon@naver.com"]);

    //폰트 일괄 지정
    worksheet.eachRow({ includeEmpty: true }, (row) => {
        row.eachCell({ includeEmpty: true }, (cell) => {
            cell.font = { size: 8 };  // Default font size
        });
    });

    //폰트 개별 지정
    cellA1L1.font = { size: 16, bold: true };

    const imageUrl = new URL('/logo.png', import.meta.url).href;
    const base64Image = await loadImageAsBase64(imageUrl);

    const imageId = workbook.addImage({
        base64: base64Image.split(',')[1], // base64 데이터에서 헤더 제거
        extension: 'png',
    });

    // Add the image to the worksheet
    const totalRows = worksheet.rowCount;
    worksheet.addImage(imageId, {
        tl: { col: 5.2, row: totalRows + 2 }, // Adjust the col and row values to center the image at the bottom
        ext: { width: 100, height: 79 } // width and height of the image
    });

    // Add a new worksheet for bookstore sales
    const salesWorksheet = workbook.addWorksheet('별첨1');
    salesWorksheet.properties.defaultRowHeight = 23.25;
    salesWorksheet.properties.defaultColWidth = 7.5;

    salesWorksheet.addRow(["[별첨1]"]);

    // Set page setup properties for A4 size and margins
    salesWorksheet.pageSetup.paperSize = 9; // A4 size
    salesWorksheet.pageSetup.margins = {
        left: 0.7, right: 0.7, top: 0.75, bottom: 0.75,
        header: 0.3, footer: 0.3
    };
    salesWorksheet.pageSetup.fitToPage = true;
    salesWorksheet.pageSetup.fitToHeight = 1;
    salesWorksheet.pageSetup.fitToWidth = 1;

    // Add title row
    const salesTitleRow = salesWorksheet.addRow([`전자책 매출액`]);
    salesTitleRow.height = titleRowHeight;
    salesTitleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    salesWorksheet.mergeCells('A2:G2');
    salesTitleRow.font = { size: 16, bold: true };
    salesWorksheet.getCell('A2').border = {
        bottom: { style: "thick", color: { argb: 'FF000000' } }
    };

    // Add quarter row
    const salesQuarterRow = salesWorksheet.addRow([author.name, quarterStr.value]);
    salesQuarterRow.height = titleRowHeight;
    salesWorksheet.mergeCells('B3:G3');
    salesWorksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };
    salesWorksheet.getCell('B3').alignment = { vertical: 'middle', horizontal: 'right' };

    // Add column headers
    const headers = ["책제목", "ISBN", "교보문고", "YES24", "알라딘", "밀리의 서재", "합계"];
    const headerRow = salesWorksheet.addRow(headers);
    headerRow.height = 25;
    headerRow.eachCell((cell, colNumber) => {
        cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9EAD3' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };

        // Set specific column widths
        if (colNumber === 1) {
            salesWorksheet.getColumn(colNumber).width = 30; // 책제목
        } else if (colNumber === 2) {
            salesWorksheet.getColumn(colNumber).width = 20; // ISBN
        } else {
            salesWorksheet.getColumn(colNumber).width = 12; // Other columns
        }
    });

    // Add sales data
    const salesData = targetAuthorRoyalties.map((authorRoyalty) => [
        authorRoyalty.royalty.bookTitle,
        authorRoyalty.royalty.isbnEBook,
        authorRoyalty.royalty.kyoboEBookAmount,
        authorRoyalty.royalty.yes24EBookAmount,
        authorRoyalty.royalty.aladinEBookAmount,
        authorRoyalty.royalty.milliEBookAmount,
        authorRoyalty.royalty.amount
    ]);

    salesData.forEach(rowData => {
        const row = salesWorksheet.addRow(rowData);
        row.height = 20;
        row.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
            cell.alignment = {
                vertical: 'middle',
                horizontal: colNumber === 1 ? 'left' : (colNumber > 2 ? 'right' : 'center')
            };
        });
    });

    // 엑셀 파일 생성
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
    // 파일 다운로드
    // const blob = new Blob([buffer], { type: 'application/octet-stream' });
    // saveAs(blob, `${author.name} ${quarter}분기 전자책 인세.xlsx`);
};

export default createExcelOfEbookRoyalties;
