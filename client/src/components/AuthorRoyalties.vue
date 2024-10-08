<template>
  <div class="royalties-summary-container">
    <h1>분기별 인세</h1>
    <div class="filters">
      <select v-model="selectedQuarter">
        <option disabled value="">분기 선택</option>
        <option v-for="quarter in quarters" :key="quarter" :value="quarter">
          {{ quarter }}
        </option>
      </select>
      <button @click="submitAllPayments" class="submit-button">모두 지급</button>
      <button @click="excelDownload" class="submit-button">엑셀 다운로드</button>
    </div>

    <div v-if="feedbackMessage" :class="{'success-message': isSuccess, 'error-message': !isSuccess}">
      {{ feedbackMessage }}
    </div>

    <table v-if="authorRoyalties.length > 0">
      <thead>
      <tr>
        <th>작가명</th>
        <th>도서명</th>
        <th>교보</th>
        <th>영풍</th>
        <th>예스24</th>
        <th>알라딘</th>
        <th>기타</th>
        <th>종이책 부수</th>
        <th>종이책 인세</th>
        <th>종이책 인세 국세</th>
        <th>종이책 인세 지방세</th>
        <th>선지급 및 기타 잔액</th>
        <th>종이책 실수령액</th>
        <th>종이책 지급</th>
        <th>교보 전자책</th>
        <th>밀리의 서재 전자책</th>
        <th>예스24 전자책</th>
        <th>알라딘 전자책</th>
        <th>전자책 인세</th>
        <th>전자책 인세 국세</th>
        <th>전자책 인세 지방세</th>
        <th>선지급 및 기타 잔액</th>
        <th>전자책 인세 실수령액</th>
        <th>전자책 지급</th>
        <th>인세합</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="authorRoyalty in authorRoyalties" :key="authorRoyalty.id">
        <td class="text-center">{{ authorRoyalty.royalty.authorName }}</td>
        <td class="text-left">{{ authorRoyalty.royalty.bookTitle }}</td>
        <td class="text-right">{{ authorRoyalty.royalty.kyoboQuantity }}</td>
        <td class="text-right">{{ authorRoyalty.royalty.youngpoongQuantity }}</td>
        <td class="text-right">{{ authorRoyalty.royalty.yes24Quantity }}</td>
        <td class="text-right">{{ authorRoyalty.royalty.aladinQuantity }}</td>
        <td class="text-right">{{ authorRoyalty.royalty.gitaQuantity }}</td>
        <td class="text-right">{{ authorRoyalty.royalty.quantity }}</td>
        <td class="text-right">{{ authorRoyalty.royalty.royaltyPaper.toLocaleString() }}</td>
        <td class="text-right">{{ authorRoyalty.royalty.royaltyPaperNationalTax.toLocaleString() }}</td>
        <td class="text-right">{{ authorRoyalty.royalty.royaltyPaperCountryTax.toLocaleString() }}</td>
        <td class="text-right">{{ authorRoyalty.balance.toLocaleString() }}</td>
        <td class="text-right">{{ authorRoyalty.netPay.toLocaleString() }}</td>
        <td class="text-right">
          <button class="submit-button" @click="submitPayment(authorRoyalty.id, true)"
                  v-if="authorRoyalty.royalty.paperPaid !== true">지급
          </button>
          <div v-else>지급 완료</div>
        </td>
        <td class="text-right">{{ authorRoyalty.royalty.kyoboEBookAmount }}</td>
        <td class="text-right">{{ authorRoyalty.royalty.milliEBookAmount }}</td>
        <td class="text-right">{{ authorRoyalty.royalty.yes24EBookAmount }}</td>
        <td class="text-right">{{ authorRoyalty.royalty.aladinEBookAmount }}</td>
        <td class="text-right">{{ authorRoyalty.royalty.royaltyEBook.toLocaleString() }}</td>
        <td class="text-right">{{ authorRoyalty.royalty.royaltyEBookNationalTax.toLocaleString() }}</td>
        <td class="text-right">{{ authorRoyalty.royalty.royaltyEBookCountryTax.toLocaleString() }}</td>
        <td class="text-right">{{ authorRoyalty.balanceEBook.toLocaleString() }}</td>
        <td class="text-right">{{ authorRoyalty.netPayEBook.toLocaleString() }}</td>
        <td class="text-right">
          <button class="submit-button" @click="submitPayment(authorRoyalty.id, false)"
                  v-if="authorRoyalty.royalty.eBookPaid !== true">지급
          </button>
          <div v-else>지급 완료</div>
        </td>
        <td class="text-right">{{ authorRoyalty.royalty.sumRoyalty.toLocaleString() }}</td>
      </tr>
      <tr>
        <td><strong>전체 합계</strong></td>
        <td class="text-right">
          <strong>{{ totalRoyaltiesSum }}</strong>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-else>조회된 인세 정보가 없습니다.</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, toRaw, watch } from "vue";
import { useStore } from "vuex";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import createExcelOfPaperRoyalties from "../utils/createExcelOfPaperRoyalties.js";
import createExcelOfEbookRoyalties from "../utils/createExcelOfEbookRoyalties.js";
import createBulkTransferExcel from "../utils/createBulkTransferExcel.js";

const selectedQuarter = ref("");
const authorRoyalties = ref([]);
const quarters = computed(() =>
    Array.from(new Set(store.state.sales.map((sale) => sale.quarter))).sort(),
);
const store = useStore();

const gitaIdNumber = store.state.GITA_ID_NUMBER;
const aladinIdNumber = store.state.ALADIN_ID_NUMBER;
const yes24IdNumber = store.state.YES_24_ID_NUMBER;
const kyoboIdNumber = store.state.KYOBO_ID_NUMBER;
const youngpoongIdNumber = store.state.YOUNGPOONG_ID_NUMBER;
const aladinEBookIdNumber = store.state.ALADIN_EBOOK_ID_NUMBER;
const yes24EBookIdNumber = store.state.YES_24_EBOOK_ID_NUMBER;
const kyoboEBookIdNumber = store.state.KYOBO_EBOOK_ID_NUMBER;
const milliEBookIdNumber = store.state.MILLI_EBOOK_ID_NUMBER;

const modifiedSalesMapByISBNQuarter = new Map();
const modifiedEBookSalesMapByISBNQuarter = new Map();
const modifiedContractsMapByAuthorAndBookId = new Map();

const totalRoyaltiesSum = computed(() => {
  return authorRoyalties.value.reduce((sum, authorRoyalty) => sum + authorRoyalty.royalty.royaltyPaper + authorRoyalty.royalty.royaltyEBook, 0,).toLocaleString();
});

onMounted(async () => {
  await store.dispatch("fetchAuthorRoyalties");
  await store.dispatch("fetchAuthors");
  await store.dispatch("fetchBooks");
  await store.dispatch("fetchSales");
  await store.dispatch("fetchEBookSales");
  await store.dispatch("fetchAuthorContracts");
  updateModifiedSalesMap();
  updateModifiedEBookSalesMap();
  updateModifiedContractsMapByAuthorAndBookId();
});

watch(selectedQuarter, async () => {
  await fetchRoyaltiesForAllAuthors();
});

watch(store.state.sales, () => {
  updateModifiedSalesMap();
});

watch(store.state.ebookSales, () => {
  updateModifiedEBookSalesMap();
});

watch(store.state.authors, () => {
  updateModifiedContractsMapByAuthorAndBookId();
});

const updateModifiedSalesMap = () => {
  store.state.sales.forEach((sale) => {
    const modifiedSale = {ISBN: sale.ISBN};
    if (modifiedSalesMapByISBNQuarter.has(`${sale.ISBN}/${sale.quarter}`)) {
      modifiedSale.quantity = parseInt(modifiedSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).quantity) + parseInt(sale.quantity);
      modifiedSale.kyoboQuantity = kyoboIdNumber === sale.bookStore.idNumber ? modifiedSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).kyoboQuantity + sale.quantity : modifiedSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).kyoboQuantity;
      modifiedSale.youngpoongQuantity = youngpoongIdNumber === sale.bookStore.idNumber ? modifiedSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).youngpoongQuantity + sale.quantity : modifiedSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).youngpoongQuantity;
      modifiedSale.yes24Quantity = yes24IdNumber === sale.bookStore.idNumber ? modifiedSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).yes24Quantity + sale.quantity : modifiedSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).yes24Quantity;
      modifiedSale.aladinQuantity = aladinIdNumber === sale.bookStore.idNumber ? modifiedSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).aladinQuantity + sale.quantity : modifiedSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).aladinQuantity;
      modifiedSale.gitaQuantity = gitaIdNumber === sale.bookStore.idNumber ? modifiedSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).gitaQuantity + sale.quantity : modifiedSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).gitaQuantity;
    } else {
      modifiedSale.kyoboQuantity = kyoboIdNumber === sale.bookStore.idNumber ? sale.quantity : 0;
      modifiedSale.youngpoongQuantity = youngpoongIdNumber === sale.bookStore.idNumber ? sale.quantity : 0;
      modifiedSale.yes24Quantity = yes24IdNumber === sale.bookStore.idNumber ? sale.quantity : 0;
      modifiedSale.aladinQuantity = aladinIdNumber === sale.bookStore.idNumber ? sale.quantity : 0;
      modifiedSale.gitaQuantity = gitaIdNumber === sale.bookStore.idNumber ? sale.quantity : 0;
      modifiedSale.quantity = parseInt(sale.quantity);
    }
    modifiedSalesMapByISBNQuarter.set(`${sale.ISBN}/${sale.quarter}`, modifiedSale);
  });
};

const updateModifiedEBookSalesMap = () => {
  store.state.ebookSales.forEach((sale) => {
    const modifiedSale = {ISBN: sale.ISBN};
    if (modifiedEBookSalesMapByISBNQuarter.has(`${sale.ISBN}/${sale.quarter}`)) {
      modifiedSale.amount = parseInt(modifiedEBookSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).amount) + parseInt(sale.amount);
      modifiedSale.kyoboEBookAmount = kyoboEBookIdNumber === sale.bookStore.idNumber ? modifiedEBookSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).kyoboEBookAmount + sale.amount : modifiedEBookSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).kyoboEBookAmount;
      modifiedSale.milliEBookAmount = milliEBookIdNumber === sale.bookStore.idNumber ? modifiedEBookSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).milliEBookAmount + sale.amount : modifiedEBookSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).milliEBookAmount;
      modifiedSale.yes24EBookAmount = yes24EBookIdNumber === sale.bookStore.idNumber ? modifiedEBookSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).yes24EBookAmount + sale.amount : modifiedEBookSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).yes24EBookAmount;
      modifiedSale.aladinEBookAmount = aladinEBookIdNumber === sale.bookStore.idNumber ? modifiedEBookSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).aladinEBookAmount + sale.amount : modifiedEBookSalesMapByISBNQuarter.get(`${sale.ISBN}/${sale.quarter}`).aladinEBookAmount;
    } else {
      modifiedSale.kyoboEBookAmount = kyoboEBookIdNumber === sale.bookStore.idNumber ? sale.amount : 0;
      modifiedSale.milliEBookAmount = milliEBookIdNumber === sale.bookStore.idNumber ? sale.amount : 0;
      modifiedSale.yes24EBookAmount = yes24EBookIdNumber === sale.bookStore.idNumber ? sale.amount : 0;
      modifiedSale.aladinEBookAmount = aladinEBookIdNumber === sale.bookStore.idNumber ? sale.amount : 0;
      modifiedSale.amount = parseInt(sale.amount);
    }
    modifiedEBookSalesMapByISBNQuarter.set(`${sale.ISBN}/${sale.quarter}`, modifiedSale);
  });
};

const updateModifiedContractsMapByAuthorAndBookId = () => {
  store.state.authorContracts.forEach((contract) => {
    const key = `${contract.authorId}/${contract.bookId}`;
    const author = store.state.authors.find((author) => author.id === contract.authorId);
    const book = store.state.books.find((book) => book.id === contract.bookId);
    modifiedContractsMapByAuthorAndBookId.set(key, {
      author: author,
      book: book,
      authorName: author.name,
      bookTitle: book.title,
      isbnPaper: book.isbnPaper,
      pricePaper: book.pricePaper,
      royaltyRatePaper: contract.royaltyRatePaper,
      isbnEBook: book.isbnEBook,
      priceEBook: book.priceEBook,
      royaltyRateEBook: contract.royaltyRateEBook,
    });
  });
};

function calculateRoyaltiesForAllAuthorsByBooks(quarter) {
  const royalties = [];
  modifiedContractsMapByAuthorAndBookId.forEach((modifiedContract) => {
    const modifiedSale = modifiedSalesMapByISBNQuarter.get(`${modifiedContract.isbnPaper}/${quarter}`);
    const royaltyPaper = modifiedSale ? parseInt(modifiedSale.quantity * modifiedContract.pricePaper * modifiedContract.royaltyRatePaper / 100) : 0
    const royaltyPaperNationalTax = parseInt(royaltyPaper * 0.03);
    const royaltyPaperCountryTax = parseInt(royaltyPaper * 0.03 * 0.1);
    const royaltyPaperAfterTax = royaltyPaper - royaltyPaperNationalTax - royaltyPaperCountryTax;
    const modifiedEBookSale = modifiedEBookSalesMapByISBNQuarter.get(`${modifiedContract.isbnEBook}/${quarter}`);
    const royaltyEBook = modifiedEBookSale ? parseInt(modifiedEBookSale.amount * modifiedContract.royaltyRateEBook / 100) : 0;
    const royaltyEBookNationalTax = parseInt(royaltyEBook * 0.03);
    const royaltyEBookCountryTax = parseInt(royaltyEBook * 0.03 * 0.1);
    const royaltyEBookAfterTax = royaltyEBook - royaltyEBookNationalTax - royaltyEBookCountryTax;
    const sumRoyalty = royaltyPaper + royaltyEBook;
    royalties.push({
      ...modifiedContract,
      author: toRaw(modifiedContract.author),
      book: toRaw(modifiedContract.book),
      kyoboQuantity: modifiedSale ? modifiedSale.kyoboQuantity : 0,
      youngpoongQuantity: modifiedSale ? modifiedSale.youngpoongQuantity : 0,
      gitaQuantity: modifiedSale ? modifiedSale.gitaQuantity : 0,
      aladinQuantity: modifiedSale ? modifiedSale.aladinQuantity : 0,
      yes24Quantity: modifiedSale ? modifiedSale.yes24Quantity : 0,
      quantity: modifiedSale ? modifiedSale.quantity : 0,
      royaltyPaper,
      royaltyPaperNationalTax,
      royaltyPaperCountryTax,
      royaltyPaperAfterTax,
      kyoboEBookAmount: modifiedEBookSale ? modifiedEBookSale.kyoboEBookAmount : 0,
      milliEBookAmount: modifiedEBookSale ? modifiedEBookSale.milliEBookAmount : 0,
      yes24EBookAmount: modifiedEBookSale ? modifiedEBookSale.yes24EBookAmount : 0,
      aladinEBookAmount: modifiedEBookSale ? modifiedEBookSale.aladinEBookAmount : 0,
      amount: modifiedEBookSale ? modifiedEBookSale.amount : 0,
      royaltyEBook,
      royaltyEBookNationalTax,
      royaltyEBookCountryTax,
      royaltyEBookAfterTax,
      sumRoyalty: sumRoyalty,
      paperPaid: false,
      eBookPaid: false,
    });
  });
  return royalties;
}

const makeKey = (quarter, authorId, bookId) => {
  return `${quarter}/${authorId}/${bookId}`;
};

const fetchRoyaltiesForAllAuthors = async () => {
  if (!selectedQuarter.value) return;
  const temp = await store.dispatch("getRoyaltiesByQuarter", selectedQuarter.value);
  // const temp = [];
  const temp4 = ref([]);
  if (temp.length === 0) {
    const rawRoyalties = calculateRoyaltiesForAllAuthorsByBooks(selectedQuarter.value);
    const temp2 = rawRoyalties.filter((royalty) => royalty.sumRoyalty > 0);
    const temp3 = [];
    const promises = temp2.map(async (royalty) => {
      if (royalty.sumRoyalty > 0) {
        const key = makeKey(selectedQuarter.value, royalty.author.id, royalty.book.id);
        const noNeed = await store.dispatch("getRoyaltyByQAB", key);
        const authorRoyalty = {
          qab: key,
          quarter: selectedQuarter.value,
          authorId: royalty.author.id,
          bookId: royalty.book.id,
          royalty: toRaw(royalty),
        }
        if (!noNeed) {
          authorRoyalty.debtId = await addDebt(authorRoyalty, selectedQuarter.value);
          await store.dispatch("addAuthorRoyalty", authorRoyalty)
        }
        temp3.push(authorRoyalty);
      }
    });
    await Promise.all(promises);
    temp4.value = temp3;
  } else {
    temp4.value = temp;
  }
  const promises = temp4.value.map(async (authorRoyalty) => {
    const targetDebt = await store.dispatch("getDebt", authorRoyalty.debtId);
    const debts = await store.dispatch("getDebtsByAb", targetDebt.ab);
    const targetDebts = debts.filter((debt) => debt.date < targetDebt.date);
    const payments = await store.dispatch("getAuthorPaymentsByAb", targetDebt.ab);
    const targetPayments = payments.filter((payment) => payment.date < targetDebt.date);
    const totalDebt = targetDebts.reduce((total, debt) => total + debt.amount, 0);
    const totalPayment = targetPayments.reduce((total, payment) => total + payment.amount, 0);
    authorRoyalty.balance = totalPayment - totalDebt;
    authorRoyalty.netPay = authorRoyalty.royalty.royaltyPaperAfterTax - authorRoyalty.balance;
    authorRoyalty.balanceEBook = authorRoyalty.netPay > 0 ? 0 : -authorRoyalty.netPay;
    authorRoyalty.netPayEBook = authorRoyalty.royalty.royaltyEBookAfterTax - authorRoyalty.balanceEBook;
    return authorRoyalty;
  })
  authorRoyalties.value = await Promise.all(promises);
  // console.log(promises.value);
  // authorRoyalties.value = temp4.value;
};

const addDebt = async (targetAuthorRoyalty, quarter) => {
  const amount = parseInt(targetAuthorRoyalty.royalty.royaltyPaperAfterTax) + parseInt(targetAuthorRoyalty.royalty.royaltyEBookAfterTax);
  const date = ref("");
  switch (quarter.slice(-1)) {
    case "1":
      date.value = `${quarter.slice(0, 4)}-04-01`;
      break;
    case "2":
      date.value = `${quarter.slice(0, 4)}-07-01`;
      break;
    case "3":
      date.value = `${quarter.slice(0, 4)}-10-01`;
      break;
    case "4":
      date.value = `${parseInt(quarter.slice(0, 4)) + 1}-01-01`;
      break;
  }
  const debt = {
    ab: `${targetAuthorRoyalty.authorId}/${targetAuthorRoyalty.bookId}`,
    authorId: targetAuthorRoyalty.authorId,
    authorName: targetAuthorRoyalty.royalty.authorName,
    bookId: targetAuthorRoyalty.bookId,
    bookTitle: targetAuthorRoyalty.royalty.bookTitle,
    date: new Date(date.value).toISOString().substring(0, 10),
    timestamp: new Date().toISOString(),
    amount,
  };
  return await store.dispatch("saveDebt", debt);  // Save to Vuex or server
};

const buildPayment = (targetAuthorRoyalty, amount) => {
  const date = ref("");
  switch (selectedQuarter.value.slice(-1)) {
    case "1":
      date.value = `${selectedQuarter.value.slice(0, 4)}-04-15`;
      break;
    case "2":
      date.value = `${selectedQuarter.value.slice(0, 4)}-07-15`;
      break;
    case "3":
      date.value = `${selectedQuarter.value.slice(0, 4)}-10-15`;
      break;
    case "4":
      date.value = `${parseInt(selectedQuarter.value.slice(0, 4)) + 1}-01-15`;
      break;
  }
  return {
    ab: `${targetAuthorRoyalty.authorId}/${targetAuthorRoyalty.bookId}`,
    authorId: targetAuthorRoyalty.authorId,
    authorName: targetAuthorRoyalty.royalty.authorName,
    bookId: targetAuthorRoyalty.bookId,
    bookTitle: targetAuthorRoyalty.royalty.bookTitle,
    date: new Date(date.value).toISOString().substring(0, 10),
    timestamp: new Date().toISOString(),
    amount,
  };
}

const submitPayment = async (authorRoyaltyId, isPaper) => {
  const targetAuthorRoyalty = authorRoyalties.value.find((authorRoyalty) => authorRoyalty.id === authorRoyaltyId);

  const amount = isPaper ? parseInt(targetAuthorRoyalty.netPay < 0 ? 0 : targetAuthorRoyalty.netPay) : parseInt(targetAuthorRoyalty.netPayEBook < 0 ? 0 : targetAuthorRoyalty.netPayEBook);
  const payment = buildPayment(targetAuthorRoyalty, amount);
  await store.dispatch("savePayment", payment);
  const targetRoyalty = targetAuthorRoyalty.royalty;
  isPaper ? targetRoyalty.paperPaid = true : targetRoyalty.eBookPaid = true;
  await store.dispatch("updateAuthorRoyalty", {
    ...targetAuthorRoyalty,
    royalty: toRaw(targetRoyalty),
  });
  await fetchRoyaltiesForAllAuthors();
}

const submitAllPayments = async () => {
  await fetchRoyaltiesForAllAuthors();
  const targetAuthorRoyalties = authorRoyalties.value;
  const payments = [];
  const updatableAuthorRoyalties = targetAuthorRoyalties.map((targetAuthorRoyalty) => {
    const amount = (targetAuthorRoyalty.netPay > 0 ? targetAuthorRoyalty.netPay : 0) + (targetAuthorRoyalty.netPayEBook > 0 ? targetAuthorRoyalty.netPayEBook : 0);
    const payment = buildPayment(targetAuthorRoyalty, amount);
    payments.push(payment);
    const targetRoyalty = targetAuthorRoyalty.royalty;
    targetRoyalty.paperPaid = true;
    targetRoyalty.eBookPaid = true;
    return {
      ...targetAuthorRoyalty,
      royalty: toRaw(targetRoyalty),
    }
  });
  await store.dispatch("addPayments", payments);  // Save to Vuex or server
  await store.dispatch("updateAuthorRoyalties", updatableAuthorRoyalties);
};


const downloadZipFile = async (authors, quarter, authorRoyalties) => {
  const zip = new JSZip();
  const authorSums = [];
  for (const author of authors) {
    const targetAuthorRoyalties = authorRoyalties.filter((authorRoyalty) => authorRoyalty.authorId === author.id);
    // 종이책 엑셀 파일 생성
    const hasPaper = ref(false);
    const hasEBook = ref(false);
    targetAuthorRoyalties.forEach((authorRoyalty) => {
      const royalty = authorRoyalty.royalty;
      hasPaper.value = hasPaper.value || !!royalty.book.isbnPaper;
      hasEBook.value = hasEBook.value || !!royalty.book.isbnEBook;
    });
    const authorSum = {author};
    if (hasPaper.value) {
      const paperObj = await createExcelOfPaperRoyalties(author, quarter, authorRoyalties);
      zip.file(`${author.name} ${quarter} 종이책 인세.xlsx`, paperObj.buffer);
      authorSum.sumPaper = paperObj.sumPaper
    }
    if (hasEBook.value) {
      const eBookObj = await createExcelOfEbookRoyalties(author, quarter, authorRoyalties);
      zip.file(`${author.name} ${quarter} 전자책 인세.xlsx`, eBookObj.buffer);
      authorSum.sumEBook = eBookObj.sumEBook
    }
    authorSums.push(authorSum);
  }
  const bulkTransferBuffer = await createBulkTransferExcel(authorSums, quarter);
  zip.file(`${quarter} 인세 이체.xlsx`, bulkTransferBuffer);

  // 압축된 ZIP 파일 생성
  const content = await zip.generateAsync({ type: 'blob' });

  // 파일 다운로드
  saveAs(content, `${quarter}_인세.zip`);
};

const excelDownload = async () => {
  const targetAuthorIds = new Set();
  authorRoyalties.value.forEach((authorRoyalty) => {
    targetAuthorIds.add(authorRoyalty.authorId);
  });
  const targetAuthors = store.state.authors.filter((author) => targetAuthorIds.has(author.id));

  // 압축 파일 다운로드 실행
  await downloadZipFile(targetAuthors, selectedQuarter.value, authorRoyalties.value);
};

const feedbackMessage = ref("");
const isSuccess = ref(false);

// const submitAllPayments = async () => {
//   let allSuccess = true;
//
//   const promises = authorRoyalties.value.map(async (authorRoyalty) => {
//     try {
//       if (authorRoyalty.royalty.paperPaid !== true) {
//         await addPayment(authorRoyalty.id, true);
//       }
//       if (authorRoyalty.royalty.eBookPaid !== true) {
//         await addPayment(authorRoyalty.id, false);
//       }
//     } catch (error) {
//       allSuccess = false;
//       console.error("지급 실패:", error);
//     }
//   });
//
//   await Promise.all(promises);
//
//   if (allSuccess) {
//     feedbackMessage.value = "모든 지급이 완료되었습니다.";
//     isSuccess.value = true;
//   } else {
//     feedbackMessage.value = "일부 지급이 실패하였습니다.";
//     isSuccess.value = false;
//   }
//
//   await fetchRoyaltiesForAllAuthors();
//
//   // 메시지를 일정 시간 후에 사라지게 하기
//   setTimeout(() => {
//     feedbackMessage.value = "";
//   }, 5000);
// };

</script>

<style scoped>
/* 스타일링 */
.royalties-summary-container {
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.royalties-summary-container h1 {
  text-align: center;
  margin-bottom: 20px;
}

.royalties-summary-container .filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.royalties-summary-container .filters select {
  margin-right: auto;
}

.royalties-summary-container .filters button {
  margin-left: auto;
}

.royalties-summary-container table {
  width: 100%; /* 테이블 너비를 부모 컨테이너에 맞춤 */
  margin: auto; /* 테이블 중앙 정렬 */
  border-collapse: collapse;
}

.royalties-summary-container th,
.royalties-summary-container td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.royalties-summary-container .text-right {
  text-align: right; /* 인세액을 우측 정렬 */
}

.success-message {
  color: green;
  margin-bottom: 10px;
  text-align: center;
}

.error-message {
  color: red;
  margin-bottom: 10px;
  text-align: center;
}
/* 추가 스타일링이 필요하면 여기에 작성 */
</style>
