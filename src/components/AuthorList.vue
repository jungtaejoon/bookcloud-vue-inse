<template>
  <div class="book-list-container">
    <h1>작가 목록</h1>
    <button
      class="add-button"
      @click="(showModal = true), (updateModal = false)"
    >
      작가 추가
    </button>
    <table>
      <thead>
        <tr>
          <th>이름</th>
          <th>주민등록번호</th>
          <th>주소</th>
          <th>계좌 번호</th>
          <th>작업</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(author, index) in sortedAuthors" :key="index">
          <td>{{ author.name }}</td>
          <td>{{ author.idNumber }}</td>
          <td>{{ author.address }}</td>
          <td>{{ author.accountNumber }}</td>
          <td class="action-buttons">
            <button
              class="edit-button"
              @click="openModal(index), (updateModal = true)"
            >
              수정
            </button>
            <button class="delete-button" @click="deleteAuthor(author)">
              삭제
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="book-overlay" @click="closeModal"></div>
    <div v-if="showModal" class="book-modal">
      <h3>작가 정보 수정</h3>
      <label>이름: <input v-model="tempAuthor.name" /></label>
      <label
        >주민등록번호:
        <input v-model="tempAuthor.idNumber" />
      </label>
      <label>주소: <input v-model="tempAuthor.address" /></label>
      <label>계좌 번호: <input v-model="tempAuthor.accountNumber" /></label>
      <button v-if="updateModal" @click="updateAuthor" class="submit-button">
        수정 완료
      </button>
      <button v-else @click="addAuthor" class="submit-button">추가</button>
      <button class="cancel-button" @click="closeModal">취소</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch, onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();
const showModal = ref(false);
const updateModal = ref(false);
const editingIndex = ref(-1);
let tempAuthor = {};

onMounted(async () => {
  await store.dispatch("fetchAuthors");
});


const sortedAuthors = computed(() => {
  return [...store.state.authors].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
});

const openModal = (index) => {
  showModal.value = true;
  editingIndex.value = index;
  tempAuthor = { ...sortedAuthors.value[index] };
};

const closeModal = () => {
  showModal.value = false;
  editingIndex.value = -1;
  resetTempAuthor();
};

const updateAuthor = async () => {
  await store.dispatch("updateAuthor", {
    author: tempAuthor,
  });
  closeModal();
  await store.dispatch("fetchAuthors");
};

const deleteAuthor = async (author) => {
  await store.dispatch("deleteAuthor", {
    author: author,
  });
  await store.dispatch("fetchAuthors");
};

const resetTempAuthor = () => {
  tempAuthor = {};
};

const addAuthor = async () => {
  await store.dispatch("addAuthor", { author: tempAuthor });
  closeModal();
  await store.dispatch("fetchAuthors");
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

.book-list-container .book-title {
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

.book-list-container .book-modal input {
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
