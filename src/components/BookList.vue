<template>
  <div class="book-list-container">
    <h1>책 목록</h1>
    <button
      class="add-button"
      @click="[(showModal = true), (updateModal = false)]"
    >
      책 추가
    </button>
    <table>
      <thead>
        <tr>
          <th>제목</th>
          <th>종이책 ISBN</th>
          <th>종이책 정가</th>
          <th>전자책 ISBN</th>
          <th>전자책 정가</th>
          <th>작업</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="book in sortedBooks" :key="book.id">
          <td>{{ book.title }}</td>
          <td>{{ book.isbnPaper }}</td>
          <td>{{ book.pricePaper }}</td>
          <td>{{ book.isbnEBook }}</td>
          <td>{{ book.priceEBook }}</td>
          <td class="action-buttons">
            <button
              class="edit-button"
              @click="[openModal(book.id), (updateModal = true)]"
            >
              수정
            </button>
            <button class="delete-button" @click="deleteBook(book.id)">
              삭제
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 책 수정 모달 -->
    <div v-if="showModal" class="book-overlay" @click="closeModal"></div>
    <div v-if="showModal" class="book-modal">
      <h3 v-if="updateModal">책 정보 수정</h3>
      <h3 v-else>책 추가</h3>
      <label>제목: <input v-model="tempBook.title" /></label>
      <label>종이책 ISBN: <input v-model="tempBook.isbnPaper" @input="filterNumericInput('isbnPaper')" /></label>
      <label>종이책 정가: <input v-model="tempBook.pricePaper" @input="filterNumericInput('pricePaper')" /></label>
      <label>전자책 ISBN: <input v-model="tempBook.isbnEBook" @input="filterNumericInput('isbnEBook')" /></label>
      <label>전자책 정가: <input v-model="tempBook.priceEBook" @input="filterNumericInput('priceEBook')" /></label>
      <button v-if="updateModal" @click="updateBook" class="submit-button">
        수정 완료
      </button>
      <button v-else @click="addBook" class="submit-button">추가</button>
      <button @click="closeModal" class="cancel-button">취소</button>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, toRaw} from "vue";
import { useStore } from "vuex";

const store = useStore();

const showModal = ref(false);
const updateModal = ref(false);
const editingIndex = ref(-1);
const tempBook = ref({});

const books = computed(() => store.state.books);

onMounted(async () => {
  await store.dispatch("fetchBooks");
});

const sortedBooks = computed(() => {
  return [...store.state.books].sort((a, b) => {
    return a.title.localeCompare(b.title);
  });
});

function filterNumericInput(field) {
  tempBook.value[field] = tempBook.value[field].replace(/\D/g, '');
}

function openModal(bookId) {
  showModal.value = true;
  tempBook.value = { ...books.value.find((book) => book.id === bookId) };
  return null;
}

function closeModal() {
  showModal.value = false;
  editingIndex.value = -1;
  tempBook.value = {};
}

const addBook = async () => {
  await store.dispatch("addBook", toRaw(tempBook.value));
  closeModal();
  await store.dispatch("fetchBooks");
};

const updateBook = async () => {
  await store.dispatch("updateBook", toRaw(tempBook.value));
  closeModal();
  await store.dispatch("fetchBooks");
};

const deleteBook = async (bookId) => {
  await store.dispatch("deleteBook", bookId);
  await store.dispatch("fetchBooks");
};
</script>

<style scoped>
/* 모든 스타일은 book-list-container 하위 요소에만 적용 */
.book-list-container {
  max-width: 800px;
  margin: 2rem auto;
  background-color: #f6f6f6;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}
.book-list-container .add-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: none;
  background-color: #00c73c;
  color: white;
  cursor: pointer;
}

.book-list-container .add-button:hover {
  background-color: #009628;
}

.book-list-container table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.book-list-container th,
.book-list-container td {
  padding: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.book-list-container {
  flex-grow: 1;
}

.book-list-container .action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.book-list-container .edit-button,
.book-list-container .delete-button {
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  margin-left: 0.5rem;
}

/* 네이버의 파란색으로 변경 */
.book-list-container .edit-button {
  background-color: #00c73c;
  color: white;
}

.book-list-container .delete-button {
  background-color: #e74c3c;
  color: white;
}

.book-list-container .book-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 2rem;
  background: #fff;
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  width: 80%;
  max-width: 500px;
}
.book-list-container .book-modal h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #333;
}

.book-list-container .book-modal label {
  display: block;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #555;
  text-align: left; /* 추가된 부분: 텍스트를 좌측 정렬 */
}

.book-list-container .book-modal input,
.book-list-container .book-modal select {
  width: 100%;
  padding: 0.8rem;
  margin-top: 0.3rem;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  appearance: none; /* 브라우저 기본 스타일 제거 */
  cursor: pointer;
  color: #333;
  box-sizing: border-box; /* 여기를 추가 */
}

/* 선택 드롭다운 화살표 디자인 (WebKit 브라우저용) */
.book-list-container .book-modal select::-webkit-inner-spin-button,
.book-list-container .book-modal select::-webkit-outer-spin-button {
  display: none;
}

.book-list-container .book-modal select::-webkit-input-placeholder {
  color: #aaa;
}

/* 선택 드롭다운 화살표 디자인 (모질라 브라우저용) */
.book-list-container .book-modal select:-moz-focusring {
  color: transparent;
  text-shadow: 0 0 0 #333;
}

.book-list-container .book-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  transition: background 0.3s;
}

.book-list-container .submit-button,
.book-list-container .cancel-button {
  display: block;
  width: 100%;
  padding: 0.8rem;
  margin-top: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.book-list-container .submit-button {
  background-color: #00c73c;
  color: white;
}

.book-list-container .submit-button:hover {
  background-color: #009628;
}

.book-list-container .cancel-button {
  background-color: #e74c3c;
  color: white;
}

.book-list-container .cancel-button:hover {
  background-color: #c0392b;
}
/* 나머지 스타일도 book-list-container에만 적용 */
.book-list-container tr:hover {
  background-color: #f1f1f1;
}

.book-list-container .edit-button:hover,
.book-list-container .delete-button:hover,
.book-list-container .submit-button:hover,
.book-list-container .cancel-button:hover {
  opacity: 0.9;
}
</style>
