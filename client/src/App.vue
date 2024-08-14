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
        <router-link to="/author-payment">저자 지급</router-link>
        <router-link to="/email-sender">이메일 발송</router-link>
        <router-link to="/converter">엑셀 컨버터</router-link>
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
import {exportToJson, clearDatabase, importFromJson} from "client/src/idb-backup-and-restore.js";
import {ref} from "vue";

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
store.state.ALADIN_EBOOK_ID_NUMBER = "00000005";
store.state.YES_24_EBOOK_ID_NUMBER = "00000006";
store.state.KYOBO_EBOOK_ID_NUMBER = "00000007";
store.state.MILLI_EBOOK_ID_NUMBER = "00000008";

const file = ref(null)
const pdfUrl = ref('')

const downloadData = async () => {
  // 현재 날짜와 시간을 가져옴
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const dateString = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

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
        a.download = `bookcloud_royalty_data_${dateString}.json`; // 파일명에 날짜와 시간 포함

        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
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
