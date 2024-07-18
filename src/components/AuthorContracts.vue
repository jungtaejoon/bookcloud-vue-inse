<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();
const sortedAuthors = computed(() => [...store.state.authors].sort((a, b) => a.name.localeCompare(b.name)));
const sortedBooks = computed(() => [...store.state.books].sort((a, b) => a.title.localeCompare(b.title)));
const sortedAuthorContracts = computed(() => [...store.state.authorContracts].sort((a, b) => getAuthorName(a.authorId).localeCompare(getAuthorName(b.authorId))));
const selectedAuthorId = ref('');
const selectedBookId = ref('');
const royaltyRatePaper = ref('');
const royaltyRateEBook = ref('');

onMounted(async () => {
  await store.dispatch("fetchAuthors");
  await store.dispatch("fetchBooks");
  await store.dispatch("fetchAuthorContracts");
});

const getAuthorName = (authorId) => store.state.authors.find(author => author.id === authorId).name;
const getBookTitle = (bookId) => store.state.books.find(book => book.id === bookId).title ;

const submitAuthorContract = async () => {
  const authorContract = {
    ab: `${selectedAuthorId.value}/${selectedBookId.value}`,
    authorId: selectedAuthorId.value,
    bookId: selectedBookId.value,
    royaltyRatePaper: royaltyRatePaper.value,
    royaltyRateEBook: royaltyRateEBook.value,
  };
  await store.dispatch("addAuthorContract", authorContract);  // Save to Vuex or server
  await store.dispatch("fetchAuthorContracts");
  resetForm();
};

const deleteAuthorContract = async (authorContractId) => {
  await store.dispatch("deleteAuthorContract", authorContractId);
  await store.dispatch("fetchAuthorContracts");
};

const resetForm = () => {
  selectedAuthorId.value = '';
  selectedBookId.value = '';
  royaltyRatePaper.value = '';
  royaltyRateEBook.value = '';
};

</script>


<template>
  <div class="contract-container">
    <h1>작가 계약 사항</h1>
    <form @submit.prevent="submitAuthorContract">
      <div class="form-group">
        <label for="author">작가 선택:</label>
        <select id="author" v-model="selectedAuthorId" @change="fetchAuthorBooks" required>
          <option disabled value="">작가를 선택해주세요</option>
          <option v-for="author in sortedAuthors" :key="author.id" :value="author.id">
            {{ author.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="book">책 선택:</label>
        <select id="book" v-model="selectedBookId" required>
          <option disabled value="">책을 선택해주세요</option>
          <option v-for="book in sortedBooks" :key="book.id" :value="book.id">
            {{ book.title }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="royaltyRatePaper">종이책 인세율 (%):</label>
        <input type="number" id="royaltyRatePaper" v-model="royaltyRatePaper" max="100">
      </div>

      <div class="form-group">
        <label for="royaltyRateEBook">전자책 인세율 (%):</label>
        <input type="number" id="royaltyRateEBook" v-model="royaltyRateEBook" max="100">
      </div>

      <button type="submit">계약 사항 저장</button>
    </form>
    <div v-if="sortedAuthorContracts.length > 0">
      <h2>작가 계약 사항</h2>
      <table>
        <thead>
        <tr>
          <th @click="sortBy('authorName')">작가명</th>
          <th @click="sortBy('date')">도서명</th>
          <th @click="sortBy('amount')">종이책 인세율(%)</th>
          <th @click="sortBy('amount')">전자책 인세율(%)</th>
          <th>조치</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="authorContract in sortedAuthorContracts" :key="authorContract.id">
          <td>{{ getAuthorName(authorContract.authorId) }}</td>
          <td>{{ getBookTitle(authorContract.bookId) }}</td>
          <td>{{ authorContract.royaltyRatePaper }}</td>
          <td>{{ authorContract.royaltyRateEBook }}</td>
          <td>
            <button @click="deleteAuthorContract(authorContract.id)">삭제</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <!-- Contract Details Table -->
  </div>
</template>

<style scoped>
.contract-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
}

select,
input[type="number"] {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

</style>
