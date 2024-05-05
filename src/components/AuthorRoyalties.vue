<template>
  <div class="royalties-container">
    <h1>작가 인세 조회</h1>
    <div class="filters">
      <select v-model="selectedAuthorId">
        <option disabled value="">작가 선택</option>
        <option
          v-for="author in sortedAuthors"
          :key="author.id"
          :value="author.id"
        >
          {{ author.name }}
        </option>
      </select>

      <select v-model="selectedQuarter">
        <option disabled value="">분기 선택</option>
        <option v-for="quarter in quarters" :key="quarter" :value="quarter">
          {{ quarter }}
        </option>
      </select>

      <button @click="fetchRoyalties">인세 정보 조회</button>
    </div>

    <table v-if="royalties.length > 0">
      <thead>
        <tr>
          <th>도서명</th>
          <th>ISBN</th>
          <th>교보</th>
          <th>영풍</th>
          <th>예스24</th>
          <th>알라딘</th>
          <th>기타</th>
          <th>합계</th>
          <th>정가</th>
          <th>인세</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="royalty in royalties" :key="royalty.id">
          <td>{{ royalty.book.title }}</td>
          <td>{{ royalty.book.isbnPaper }}</td>
          <td>{{ royalty.kyoboQuantity }}</td>
          <td>{{ royalty.youngpoongQuantity }}</td>
          <td>{{ royalty.yes24Quantity }}</td>
          <td>{{ royalty.aladinQuantity }}</td>
          <td>{{ royalty.gitaQuantity }}</td>
          <td>{{ royalty.total }}</td>
          <td>{{ royalty.pricePaper }}</td>
          <td>{{ royalty.royalty }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else>조회된 인세 정보가 없습니다.</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from "vue";
import { useStore } from "vuex";

const store = useStore();

const gitaIdNumber = store.state.GITA_ID_NUMBER;
const aladinIdNumber = store.state.ALADIN_ID_NUMBER;
const yes24IdNumber = store.state.YES_24_ID_NUMBER;
const kyoboIdNumber = store.state.KYOBO_ID_NUMBER;
const youngpoongIdNumber = store.state.YOUNGPOONG_ID_NUMBER;

const selectedAuthorId = ref("");
const selectedQuarter = ref("");
const royalties = ref([]);

const sortedAuthors = computed(() => {
  return [...store.state.authors].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
});

const books = computed(() => store.state.books);
const sales = computed(() => store.state.sales);
const authorContracts = computed(() => store.state.authorContracts);

const quarters = computed(() =>
  Array.from(new Set(store.state.sales.map((sale) => sale.quarter))).sort(),
); // 예시 데이터, 실제 애플리케이션에서는 동적으로 분기 데이터를 생성할 수 있습니다.


onMounted(async () => {
  await store.dispatch("fetchAuthors");
  await store.dispatch("fetchBooks");
  await store.dispatch("fetchSales");
  await store.dispatch("fetchAuthorContracts");
});

// function updateOrAddItem(array, key, additionalValue) {
//   // 배열 내에서 주어진 key를 가진 항목을 찾습니다.
//   const index = array.findIndex((item) => item.key === key);
//
//   if (index !== -1) {
//     // 항목이 존재하면 value에 값을 더합니다.
//     array[index].value += additionalValue;
//   } else {
//     // 항목이 존재하지 않으면 새 항목을 추가합니다.
//     array.push({ key: key, value: additionalValue });
//   }
// }

function mergeQuantitiesByBook(tempMergedSalesByBookStore, book, sale) {
  const index = tempMergedSalesByBookStore.findIndex(
    (item) =>
      item.bookStore["id"] === sale.bookStore.id &&
      item.ISBN === book.isbnPaper,
  );

  if (index !== -1) {
    // 항목이 존재하면 value에 값을 더합니다.
    tempMergedSalesByBookStore[index].quantity += sale.quantity;
  } else {
    // 항목이 존재하지 않으면 새 항목을 추가합니다.
    tempMergedSalesByBookStore.push({
      ISBN: book.isbnPaper,
      bookStore: sale.bookStore,
      quantity: sale.quantity,
    });
  }
}

function buildRoyaltyTable(array, authorContractsMap) {
  const royaltyTable = [];
  array.forEach((sale) => {
    const index = royaltyTable.findIndex(
      (item) => item.book["isbnPaper"] === sale.ISBN,
    );
    if (index !== -1) {
      switch (sale.bookStore.idNumber) {
        case kyoboIdNumber:
          royaltyTable[index].kyoboQuantity = sale.quantity;
          break;
        case youngpoongIdNumber:
          royaltyTable[index].youngpoongQuantity = sale.quantity;
          break;
        case yes24IdNumber:
          royaltyTable[index].yes24Quantity = sale.quantity;
          break;
        case aladinIdNumber:
          royaltyTable[index].aladinQuantity = sale.quantity;
          break;
        case gitaIdNumber:
          royaltyTable[index].gitaQuantity = sale.quantity;
          break;
      }
      royaltyTable[index].total += sale.quantity;
    } else {
      const targetBook = books.value.find((book) => book.isbnPaper === sale.ISBN)
      royaltyTable.push({
        book: targetBook,
        kyoboQuantity:
          kyoboIdNumber === sale.bookStore.idNumber ? sale.quantity : 0,
        youngpoongQuantity:
          youngpoongIdNumber === sale.bookStore.idNumber ? sale.quantity : 0,
        yes24Quantity:
          yes24IdNumber === sale.bookStore.idNumber ? sale.quantity : 0,
        aladinQuantity:
          aladinIdNumber === sale.bookStore.idNumber ? sale.quantity : 0,
        gitaQuantity:
          gitaIdNumber === sale.bookStore.idNumber ? sale.quantity : 0,
        total: sale.quantity,
        pricePaper: targetBook.pricePaper,
      });
    }
  });
  const temp = royaltyTable.map((royalty) => {return { ...royalty, royalty: royalty.total * royalty.pricePaper * authorContractsMap.get(royalty.book.id).royaltyRatePaper / 100}});
  return temp;
}

const fetchRoyalties = async () => {
  royalties.value = [];
  const selectedAuthorContracts = authorContracts.value.filter((authorContract) => authorContract.authorId === selectedAuthorId.value);
  const selectedAuthorContractsMap = new Map(selectedAuthorContracts.map((authorContract) => [authorContract.bookId, authorContract]));
  const authorBooks = books.value.filter((book) => selectedAuthorContractsMap.has(book.id));
  const tempArray = [];
  sales.value.forEach((sale) => {
    authorBooks.forEach((book) => {
      if (
        book.isbnPaper === sale.ISBN &&
        sale.quarter === selectedQuarter.value
      ) {
        mergeQuantitiesByBook(tempArray, book, sale);
      }
    });
  });
  royalties.value = buildRoyaltyTable(tempArray, selectedAuthorContractsMap);

  // 인세 정보 조회 로직
  // store.dispatch('fetchRoyalties', { authorId: selectedAuthorId.value, quarter: selectedQuarter.value });
  // 예시 데이터
};
</script>

<style scoped>
/* 스타일링 */
.royalties-container .filters {
  margin-bottom: 20px;
}

.royalties-container select,
.royalties-container button {
  margin-right: 10px;
}

.royalties-container table {
  width: 100%;
  border-collapse: collapse;
}

.royalties-container th,
.royalties-container td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

/* 추가 스타일링이 필요하면 여기에 작성 */
</style>
