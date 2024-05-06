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
    </div>

    <table v-if="authorRoyalties.length > 0">
      <thead>
        <tr>
          <th>작가명</th>
          <th>인세액</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="royalty in authorRoyalties" :key="royalty.authorId">
          <td class="text-center">{{ royalty.authorName }}</td>
          <td class="text-right">{{ royalty.totalRoyalties }}</td>
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
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();
const selectedQuarter = ref("");
const quarters = computed(() =>
  Array.from(new Set(store.state.sales.map((sale) => sale.quarter))).sort(),
);
const authorRoyalties = ref([]);

// 전체 인세 합계를 계산
const totalRoyaltiesSum = computed(() => {
  return authorRoyalties.value
    .reduce(
      (sum, royalty) =>
        sum + parseFloat(royalty.totalRoyalties.replace(/,/g, "")),
      0,
    )
    .toLocaleString();
});

onMounted(async () => {
  await store.dispatch("fetchSales");
});

const fetchRoyaltiesForAllAuthors = async () => {
  if (!selectedQuarter.value) return;
  const rawRoyalties = calculateRoyaltiesForAllAuthors({
    quarter: selectedQuarter.value,
  });
  authorRoyalties.value = rawRoyalties.map((royalty) => ({
    authorName: royalty.authorName,
    totalRoyalties: formatCurrency(Math.floor(royalty.totalRoyalties * 0.967)),
  }));
};

function calculateRoyaltiesForAllAuthors({ quarter }) {
  let royalties = [];
  store.state.authors.forEach((author) => {
    let totalRoyalties = 0;
    const targetAuthorContracts = store.state.authorContracts.filter((authorContract) => authorContract.authorId === author.id);
    const targetAuthorContractsMapByBookId = new Map(targetAuthorContracts.map(authorContract => [authorContract.bookId, authorContract]));
    const targetBooks = store.state.books.filter((book) => targetAuthorContractsMapByBookId.has(book.id));
    const targetBooksMapByIsbnPaper = new Map(targetBooks.map((book) => [book.isbnPaper, book]));
    store.state.sales.forEach((sale) => {
      if (targetBooksMapByIsbnPaper.has(sale.ISBN) && sale.quarter === quarter) {
        const targetBook = (targetBooksMapByIsbnPaper.get(sale.ISBN));
        totalRoyalties +=
            (targetBook.pricePaper * targetAuthorContractsMapByBookId.get(targetBook.id).royaltyRatePaper / 100) * sale.quantity;
      }
    });

    royalties.push({
      authorId: author.id,
      authorName: author.name,
      totalRoyalties: totalRoyalties,
    });
  });
  return royalties;
}

function formatCurrency(num) {
  return num.toLocaleString();
}
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
  margin-bottom: 20px;
  text-align: center;
}

.royalties-summary-container select,
.royalties-summary-container button {
  margin-right: 10px;
}

.royalties-summary-container table {
  width: 100%; /* 테이블 너비를 부모 컨테이너에 맞춤 */
  max-width: 300px; /* 테이블 최대 너비 고정 */
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
