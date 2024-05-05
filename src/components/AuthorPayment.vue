<template>
  <div class="payment-container">
    <h1>작가별 지급 기록</h1>
    <form @submit.prevent="submitPayment">
      <div class="form-group">
        <label for="author">작가 선택:</label>
        <select id="author" v-model="selectedAuthorId" required>
          <option disabled value="">작가를 선택해주세요</option>
          <option v-for="author in sortedAuthors" :key="author.id" :value="author.id">
            {{ author.name }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="authorBooks.length > 0">
        <label for="book">책 선택:</label>
        <select id="book" v-model="selectedBookId" required>
          <option disabled value="">책을 선택해주세요</option>
          <option v-for="book in authorBooks" :key="book.id" :value="book.id">
            {{ book.title }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="paymentDate">지급 날짜:</label>
        <input type="date" id="paymentDate" v-model="paymentDate" required>
      </div>

      <div class="form-group">
        <label for="amount">지급액:</label>
        <input type="number" id="amount" v-model="amount" required>
      </div>

      <button type="submit">지급 기록 저장</button>
    </form>

    <div v-if="sortedPayments.length > 0">
      <h2>지급 내역</h2>
      <table>
        <thead>
        <tr>
          <th @click="sortBy('authorName')">작가명</th>
          <th @click="sortBy('date')">지급 날짜</th>
          <th @click="sortBy('amount')">지급액</th>
          <th>조치</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="payment in sortedPayments" :key="payment.id">
          <td>{{ payment.authorName }}</td>
          <td>{{ payment.date }}</td>
          <td>{{ payment.amount }}</td>
          <td>
            <button @click="deletePayment(payment.id)">삭제</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";

const store = useStore();
const sortedAuthors = computed(() => {
  return [...store.state.authors].sort((a, b) => a.name.localeCompare(b.name));
});
const books = computed(() => store.state.books);
const selectedAuthorId = ref('');
const paymentDate = ref(new Date().toISOString().substring(0, 10));
const authorBooks = ref([]);
const amount = ref('');
const sortedPayments = ref([]);
const sortKey = ref(null);
const sortOrder = ref(null);

onMounted(async () => {
  await store.dispatch("fetchAuthors");
  await store.dispatch('fetchBooks');
  await store.dispatch('fetchAuthorPayments');
  sortedPayments.value = [...store.state.authorPayments];
});

watch(selectedAuthorId, (newVal) => {
  if (newVal) {
     fetchAuthorBooks(newVal);
  }
});

const fetchAuthorBooks = (authorId) => {
  authorBooks.value = books.value.filter((book) => book.author.id === authorId);
};

const submitPayment = async () => {
  const payment = {
    authorId: selectedAuthorId.value,
    authorName: sortedAuthors.value.find(author => author.id === selectedAuthorId.value).name,
    date: paymentDate.value,
    amount: parseFloat(amount.value)
  };
  await store.dispatch("savePayment", { payment: payment });  // Save to Vuex or server
  await store.dispatch('fetchAuthorPayments');
  resetForm();
};

const deletePayment = async (paymentId) => {
  await store.dispatch("deletePayment", paymentId); // Delete payment from Vuex or server
  await store.dispatch('fetchAuthorPayments'); // Refresh payments list
};

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  sortedPayments.value.sort((a, b) => {
    let result = 0;
    if (a[key] < b[key]) result = -1;
    if (a[key] > b[key]) result = 1;
    return sortOrder.value === 'asc' ? result : -result;
  });
};

const resetForm = () => {
  selectedAuthorId.value = '';
  amount.value = '';
};
</script>

<style scoped>
.payment-container {
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

input[type="date"],
input[type="number"],
select {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
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
