<template>
  <div class="royalties-summary-container">
    <h1>분기별 인세 요약</h1>
    <div class="filters">
      <select v-model="selectedQuarter">
        <option disabled value="">분기 선택</option>
        <option v-for="quarter in quarters" :key="quarter" :value="quarter">
          {{ quarter }}
        </option>
      </select>
      <button @click="fetchRoyaltiesForAllAuthors">인세 요약 조회</button>
      <button class="save-royalties-button" @click="addRoyalties">인세 저장</button>
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
          <th>전자책 인세</th>
          <th>인세합</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="royalty in authorRoyalties" :key="royalty.authorId">
          <td class="text-center">{{ royalty.authorName }}</td>
          <td class="text-left">{{ royalty.bookTitle }}</td>
          <td class="text-right">{{ royalty.kyoboQuantity }}</td>
          <td class="text-right">{{ royalty.youngpoongQuantity }}</td>
          <td class="text-right">{{ royalty.yes24Quantity }}</td>
          <td class="text-right">{{ royalty.aladinQuantity }}</td>
          <td class="text-right">{{ royalty.gitaQuantity }}</td>
          <td class="text-right">{{ royalty.quantity }}</td>
          <td class="text-right">{{ royalty.royaltyPaper.toLocaleString() }}</td>
          <td class="text-right">{{ royalty.royaltyEBook.toLocaleString() }}</td>
          <td class="text-right">{{ royalty.sumRoyalty.toLocaleString() }}</td>
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
import {ref, computed, onMounted, watch, toRaw} from "vue";
import { useStore } from "vuex";

const store = useStore();

const gitaIdNumber = store.state.GITA_ID_NUMBER;
const aladinIdNumber = store.state.ALADIN_ID_NUMBER;
const yes24IdNumber = store.state.YES_24_ID_NUMBER;
const kyoboIdNumber = store.state.KYOBO_ID_NUMBER;
const youngpoongIdNumber = store.state.YOUNGPOONG_ID_NUMBER;

const books = computed(() => store.state.books);
const sales = computed(() => store.state.sales);
const authorContracts = computed(() => store.state.authorContracts);

const selectedQuarter = ref("");
const quarters = computed(() =>
  Array.from(new Set(store.state.sales.map((sale) => sale.quarter))).sort(),
);
const authorRoyalties = ref([]);
const modifiedSalesMapByISBNQuarter = new Map();
const modifiedContractsMapByAuthorAndBookId = new Map();

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

watch(store.state.sales, () => {
  updateModifiedSalesMap();
});

watch(store.state.authors, () => {
  updateModifiedContractsMapByAuthorAndBookId();
});

// 전체 인세 합계를 계산
const totalRoyaltiesSum = computed(() => {
  return authorRoyalties.value.reduce((sum, royalty) => sum + royalty.royaltyPaper + royalty.royaltyEBook, 0, ).toLocaleString();
});

onMounted(async () => {
  await store.dispatch("fetchAuthors");
  await store.dispatch("fetchBooks");
  await store.dispatch("fetchSales");
  await store.dispatch("fetchAuthorContracts");
  updateModifiedSalesMap();
  updateModifiedContractsMapByAuthorAndBookId();
});

const fetchRoyaltiesForAllAuthors = async () => {
  if (!selectedQuarter.value) return;
  const rawRoyalties = calculateRoyaltiesForAllAuthorsByBooks(selectedQuarter.value);
  authorRoyalties.value = rawRoyalties.filter((royalty) => royalty.sumRoyalty > 0);
  const promises = authorRoyalties.value.map(async (royalty) => {
    if(royalty.sumRoyalty > 0) {
      const key = makeKey(selectedQuarter.value, royalty.author.id, royalty.book.id);
      const noNeed = await store.dispatch("getRoyalty", key);
      if(!noNeed) {
        await store.dispatch("addRoyalty", {qab: key, royalty: toRaw(royalty)})
      }
    }
  });
  await Promise.all(promises);
};

const makeKey = (quarter, authorId, bookId) => {
  return `${quarter}/${authorId}/${bookId}`;
};

function calculateRoyaltiesForAllAuthorsByBooks(quarter) {
  const royalties = [];
  modifiedContractsMapByAuthorAndBookId.forEach((modifiedContract) => {
    const modifiedSale = modifiedSalesMapByISBNQuarter.get(`${modifiedContract.isbnPaper}/${quarter}`);
    const royaltyPaper = modifiedSale ? modifiedSale.quantity * modifiedContract.pricePaper * modifiedContract.royaltyRatePaper / 100 : 0
    const royaltyEBook = 0;
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
      royaltyPaper: royaltyPaper,
      royaltyEBook: royaltyEBook,
      sumRoyalty: sumRoyalty,
    });
  });
  return royalties;
}

const addRoyalties = () => {

};

</script>

<style scoped>
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

.royalties-summary-container .filters button.save-royalties-button {
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
</style>
