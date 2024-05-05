<template>
  <div>
    <h1>Book Sales Dashboard</h1>

    <!-- Book Selection -->
    <label for="book-select">Select a Book:</label>
    <select v-model="selectedBook" id="book-select">
      <option v-for="book in books" :key="book.id" :value="book.id">
        {{ book.title }}
      </option>
    </select>

    <!-- Year and Quarter Selection -->
    <div>
      <label for="year-select">Select a Year:</label>
      <select v-model="selectedYear" id="year-select">
        <option v-for="year in years" :key="year" :value="year">
          {{ year }}
        </option>
      </select>

      <label for="quarter-select">Select a Quarter:</label>
      <select v-model="selectedQuarter" id="quarter-select">
        <option v-for="quarter in quarters" :key="quarter" :value="quarter">
          Q{{ quarter }}
        </option>
      </select>
    </div>

    <!-- Display Sales Data -->
    <div v-if="selectedBook && selectedYear && selectedQuarter">
      <h2>{{ getBookTitle(selectedBook) }} Sales Data</h2>
      <h3>{{ selectedYear }} Q{{ selectedQuarter }}</h3>

      <div>
        <h4>Paperback Sales</h4>
        <ul>
          <li v-for="store in paperbackStores" :key="store">
            Store: {{ store }}, Sales: {{ getSalesData("Paperback", store) }}
          </li>
        </ul>
      </div>

      <div>
        <h4>E-Book Sales</h4>
        <ul>
          <li v-for="store in ebookStores" :key="store">
            Store: {{ store }}, Sales: {{ getSalesData("E-Book", store) }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Sample data
const books = [
  { id: 1, title: "Book 1" },
  { id: 2, title: "Book 2" },
  { id: 3, title: "Book 3" },
];

const salesData = [
  // Example sales data
  // { bookId: 1, year: 2023, quarter: 1, type: 'Paperback', store: 'Yes24', sales: 1000 },
  // Add more data here
];

const years = [2021, 2022, 2023];
const quarters = [1, 2, 3, 4];
const paperbackStores = ["교보문고", "예스24", "알라딘", "영풍문고"];
const ebookStores = ["교보문고", "예스24", "알라딘", "밀리의 서재"];

// Selected values
const selectedBook = ref(null);
const selectedYear = ref(null);
const selectedQuarter = ref(null);

const getBookTitle = (bookId) =>
  books.find((book) => book.id === bookId)?.title;
const getSalesData = (type, store) => {
  const data = salesData.find(
    (s) =>
      s.bookId === selectedBook.value &&
      s.year === selectedYear.value &&
      s.quarter === selectedQuarter.value &&
      s.type === type &&
      s.store === store
  );
  return data ? data.sales : "N/A";
};
</script>

<style scoped>
.book-sales-list-container {
  max-width: 800px;
  margin: 2rem auto;
  background-color: #f6f6f6;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filters {
  margin-bottom: 1rem;
  text-align: left;
}

.filters label {
  margin-right: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

tr:hover {
  background-color: #f1f1f1;
}
</style>
