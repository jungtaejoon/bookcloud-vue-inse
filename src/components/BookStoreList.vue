<template>
  <div class="bookstore-list-container">
    <h1>서점 목록</h1>
    <button class="add-button" @click="openAddModal">서점 추가</button>
    <table>
      <thead>
        <tr>
          <th>서점명</th>
          <th>서점 고유 번호</th>
          <th>출고부수</th>
          <th>출고액</th>
          <th>입금액</th>
          <th>미수금</th>
          <th>기타</th>
          <th>작업</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="store in bookStores" :key="store.id">
          <td>{{ store.name }}</td>
          <td>{{ store.idNumber }}</td>
          <td>{{ store.shippedQuantity }}</td>
          <td>{{ store.shippedAmount }}</td>
          <td>{{ store.depositAmount }}</td>
          <td>{{ store.outstandingBalance }}</td>
          <td>{{ store.notes }}</td>
          <td class="action-buttons">
            <button class="edit-button" @click="openEditModal(store)">
              수정
            </button>
            <button class="delete-button" @click="deleteBookStore(store.id)">
              삭제
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- 서점 수정/추가 모달 -->
    <div v-if="showModal" class="bookstore-overlay" @click="closeModal"></div>
    <div v-if="showModal" class="bookstore-modal">
      <h3 v-if="updateModal">서점 정보 수정</h3>
      <h3 v-else>서점 추가</h3>
      <label>서점명: <input v-model="tempBookStore.name" /></label>
      <label>서점 고유 번호: <input v-model="tempBookStore.idNumber" /></label>
      <label
        >출고부수: <input v-model="tempBookStore.shippedQuantity" type="number"
      /></label>
      <label
        >출고액: <input v-model="tempBookStore.shippedAmount" type="number"
      /></label>
      <label
        >입금액: <input v-model="tempBookStore.depositAmount" type="number"
      /></label>
      <label
        >미수금:
        <input v-model="tempBookStore.outstandingBalance" type="number"
      /></label>
      <label>기타: <textarea v-model="tempBookStore.notes"></textarea></label>
      <button v-if="updateModal" @click="updateBookStore" class="submit-button">
        수정 완료
      </button>
      <button v-else @click="addBookStore" class="submit-button">추가</button>
      <button type="button" @click="closeModal" class="cancel-button">
        취소
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";

const store = useStore();
const showModal = ref(false);
const updateModal = ref(false);
let tempBookStore = {};

const bookStores = computed(() => store.state.bookStores);

onMounted(async () => {
  await store.dispatch("fetchBookStores");
});

const openAddModal = () => {
  updateModal.value = false;
  showModal.value = true;
  tempBookStore = {}; // 새 서점 추가를 위해 초기화
};

const openEditModal = (storeData) => {
  updateModal.value = true;
  showModal.value = true;
  tempBookStore = { ...storeData };
};

const closeModal = () => {
  showModal.value = false;
  tempBookStore = {};
};

const addBookStore = async () => {
  await store.dispatch("addBookStore", {
    bookStore: tempBookStore,
  });
  closeModal();
  await store.dispatch("fetchBookStores");
};

const updateBookStore = async () => {
  await store.dispatch("updateBookStore", {
    bookStore: tempBookStore,
  });
  closeModal();
  await store.dispatch("fetchBookStores");
};

const deleteBookStore = async (bookStoreId) => {
  await store.dispatch("deleteBookStore", {
    bookStoreId: bookStoreId,
  });
  await store.dispatch("fetchBookStores");
};
</script>

<style scoped>
.bookstore-list-container {
  max-width: 800px;
  margin: 2rem auto;
  background-color: #f6f6f6;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}
.bookstore-list-container .add-button {
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: none;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
}
.bookstore-list-container .add-button:hover {
  background-color: #45a049;
}
.bookstore-list-container table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.bookstore-list-container th,
.bookstore-list-container td {
  padding: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}
.bookstore-list-container .action-buttons {
  display: flex;
  justify-content: center;
}
.bookstore-list-container .edit-button,
.bookstore-list-container .delete-button {
  padding: 0.5rem 1rem;
  margin: 0.5rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}
.bookstore-list-container .edit-button {
  background-color: #008cba;
  color: white;
}
.bookstore-list-container .delete-button {
  background-color: #f44336;
  color: white;
}
.bookstore-list-container .bookstore-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 10;
}
.bookstore-list-container .bookstore-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 11;
  width: 80%;
  max-width: 500px;
}
.bookstore-list-container .bookstore-modal h3 {
  margin-bottom: 1.5rem;
}
.bookstore-list-container .bookstore-modal form {
  display: grid;
  gap: 1rem;
}
.bookstore-list-container .bookstore-modal label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.bookstore-list-container .bookstore-modal input,
.bookstore-list-container .bookstore-modal textarea {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
}
.bookstore-list-container .bookstore-modal .submit-button,
.bookstore-list-container .bookstore-modal .cancel-button {
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}
.bookstore-list-container .bookstore-modal .submit-button {
  background-color: #4caf50;
  color: white;
}
.bookstore-list-container .bookstore-modal .cancel-button {
  background-color: #f44336;
  color: white;
}
</style>
