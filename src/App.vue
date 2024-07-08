<template>
  <div class="container">
    <nav class="nav-bar">
      <router-link to="/">
        <div class="logo">MyApp</div>
      </router-link>
      <div class="nav-links">
        <router-link to="/authors">작가 조회</router-link>
        <router-link to="/books">책 조회</router-link>
        <router-link to="/author-contracts">저자 계약 조회</router-link>
        <router-link to="/bookStores">서점 조회</router-link>
        <router-link to="/book-sales-parser">매출 입력</router-link>
        <router-link to="/author-royalties">인세</router-link>
        <router-link to="/total-royalties">인세합</router-link>
        <router-link to="/author-payment">저자 지급</router-link>
      </div>
      <div class="data-actions">
        <button @click="downloadData">데이터 다운로드</button>
        <input type="file" @change="uploadData"/>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script setup>
import {useStore} from "vuex";
import {getDB} from "./db.js";
import {exportToJson, clearDatabase, importFromJson} from "/src/idb-backup-and-restore.js";

const store = useStore();

const DB_NAME = "INSE";
const DB_VERSION = 2;
const AUTHORS_STRING = "authors";
const BOOKS_STRING = "books";
const BOOK_STORES_STRING = "bookStores";
const AUTHOR_PAYMENTS_STRING = "authorPayments";
const SALES_STRING = "sales";
const BOOK_STORE_EXCEL_KEY_AND_NAME_STRING = "bookStoreExcelKeyAndName";

store.state.GITA_ID_NUMBER = "00000000";
store.state.ALADIN_ID_NUMBER = "00000001";
store.state.YES_24_ID_NUMBER = "00000002";
store.state.KYOBO_ID_NUMBER = "00000003";
store.state.YOUNGPOONG_ID_NUMBER = "00000004";

const downloadData = async () => {
  // 데이터를 문자열로 변환
  const db = await getDB();
  exportToJson(db)
      .then(result => {
        // 데이터를 blob 형태로 생성
        const blob = new Blob([result], {type: "application/json"});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "data.json";

        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        console.log('Exported JSON string:', result)
      })
      .catch(error => {
        console.error('Something went wrong during export:', error)
      });

};

const uploadData = async (event) => {


  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = async (e) => {
    const db = await getDB();
    clearDatabase(db)
        .then(() => {
          console.log("DB cleared! ");
          importFromJson(db, e.target.result)
              .then(() => {
                console.log('Successfully imported data');
              })
              .catch(error => {
                console.error('Something went wrong during import:', error);
              });
        })
        .catch(error => {
          console.error('Something went wrong during upload:', error);
        });
    // const data = JSON.parse(e.target.result);
    // store.commit("SET_AUTHORS", data.authors);
    // store.commit("setBooks", data.books);
  };
  reader.readAsText(file);
};
</script>

<style>
.container {
  max-width: 2500px;
  margin: 0 auto;
  padding: 1rem;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: #1f1f1f;
  color: white;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background-color 0.2s;
}

.nav-links a:hover {
  background-color: #4d4d4d;
}

.data-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

input,
select,
button {
  display: block;
  margin: 0.5rem 0;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
}

button {
  background-color: #0079d3;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #005a8e;
}
</style>
