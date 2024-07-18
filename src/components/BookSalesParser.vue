<!--<template>-->
<!--  <div class="container">-->
<!--    <h2>서점별 데이터 파싱</h2>-->
<!--    <table class="data-table">-->
<!--      <thead>-->
<!--        <tr>-->
<!--          <th>서점명</th>-->
<!--          <th>파일 업로드</th>-->
<!--          <th>상태</th>-->
<!--        </tr>-->
<!--      </thead>-->
<!--      <tbody>-->
<!--        <tr v-for="store in stores" :key="store.id">-->
<!--          <td>{{ store.name }}</td>-->
<!--          <td>-->
<!--            <input type="file" @change="parseData(store.id, $event)" />-->
<!--          </td>-->
<!--          <td>{{ store.status }}</td>-->
<!--        </tr>-->
<!--      </tbody>-->
<!--    </table>-->
<!--    <xlsx-read :file="file">-->
<!--      <xlsx-json>-->
<!--        <template #default="{ loading }">-->
<!--          {{ doSomething(loading) }}-->
<!--          <span v-if="loading">Loading...</span>-->
<!--        </template>-->
<!--      </xlsx-json>-->
<!--    </xlsx-read>-->
<!--  </div>-->
<!--</template>-->

<template>
  <div class="container my-4">
    <div class="mb-3">
      <button class="btn btn-primary" @click="triggerFileInput">
        엑셀 파일 체크
      </button>
      <div
          class="mb-3"
          v-if="
          (tempHeaders === YES_24_HEADER_STRING ||
            tempHeaders === KYOBO_HEADER_STRING ||
            tempHeaders === YOUNGPOONG_HEADER_STRING ||
            tempHeaders === YES_24_EBOOK_HEADER_STRING) &&
          processSwitch === 3
        "
      >
        <label for="quarterInput" class="form-label"
        >분기 입력 (예: 2024-1)</label
        >
        <input
            type="text"
            id="quarterInput"
            v-model="inputQuarter"
            class="form-control"
            placeholder="예: 2024-1"
        />
      </div>
      <button
          v-if="processSwitch === 3"
          class="btn btn-primary"
          @click="addSaleByBookStore"
      >
        업로드
      </button>
      <input
          type="file"
          id="fileInput"
          @change="onChange"
          :key="fileKey"
          style="display: none"
      />
    </div>
    <button class="btn btn-info mb-3" @click="showAladinInputModal = true">
      알라딘 입력
    </button>
    <button
        v-if="salesData.length > 0"
        class="btn btn-primary"
        @click="addAladinSale"
    >
      알라딘 업로드
    </button>
    <!-- 알라딘 데이터 입력 모달 -->
    <div v-if="showAladinInputModal" class="modal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">알라딘 서점 판매 데이터 입력</h5>
            <button type="button" class="close" @click="closeModal">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="quarterInput" class="form-label"
              >분기 입력 (예: 2024-1)</label
              >
              <input
                  type="text"
                  id="quarterInput"
                  v-model="inputQuarter"
                  class="form-control"
                  placeholder="예: 2024-1"
              />
            </div>
            <textarea
                class="form-control"
                rows="10"
                placeholder="여기에 알라딘 서점 판매 데이터를 복사하여 붙여넣으세요..."
                @paste="handlePaste"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- 로딩 상태 표시 -->
    <div v-if="isLoading" class="loading-indicator">
      데이터를 업로드 중입니다...
    </div>

    <!-- 성공 메시지 표시 -->
    <div v-if="isSuccess" class="alert alert-success">
      데이터가 성공적으로 업로드되었습니다!
    </div>

    <!-- 에러 메시지 표시 -->
    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>
    <label v-if="processSwitch === 2">
      서점:
      <select v-model="bookStoreExcelKeyAndName.bookStore">
        <option
            v-for="bookStore in bookStores"
            :key="bookStore.id"
            :value="bookStore"
        >
          {{ bookStore.name }}
        </option>
      </select>
      <button class="btn btn-success" @click="addBookStoreExcelKeyAndName">
        추가
      </button>
    </label>
    <div v-if="salesData.length > 0">
      <h3 class="mt-4">붙여넣기한 데이터</h3>
      <table class="table table-bordered">
        <thead>
        <tr>
          <th>ISBN</th>
          <th>판매 권수</th>
          <th>분기</th>
          <th>서점</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(sale, index) in salesData" :key="index">
          <td>{{ sale.ISBN }}</td>
          <td>{{ sale.quantity }}</td>
          <td>{{ sale.quarter }}</td>
          <td>{{ sale.bookStore.name }}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <div v-if="tempCollection && tempCollection.length > 0">
      <h3 class="mt-4">파일 데이터</h3>
      <table class="table table-bordered">
        <thead>
        <tr>
          <th v-for="(header, index) in tempCollection[0]" :key="index">
            {{ header }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(row, index) in tempCollection.slice(1)" :key="index">
          <td v-for="(cell, idx) in row" :key="idx">
            {{ cell }}
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import {ref, nextTick, onMounted, computed, toRaw} from "vue";
import * as XLSX from 'xlsx';
import {useStore} from "vuex";
import similarityByPrefix from "../utils/textComparison.js";

const store = useStore();

const fileKey = ref(0);
const jsonKey = ref(0);
const file = ref(null);

const processSwitch = ref(1);
const tempHeaders = ref(null);
const tempCollection = ref(null);

const showAladinInputModal = ref(false);
const inputQuarter = ref("");

const salesData = ref([]);

const gitaIdNumber = store.state.GITA_ID_NUMBER;
const aladinIdNumber = store.state.ALADIN_ID_NUMBER;
const yes24IdNumber = store.state.YES_24_ID_NUMBER;
const kyoboIdNumber = store.state.KYOBO_ID_NUMBER;
const youngpoongIdNumber = store.state.YOUNGPOONG_ID_NUMBER;
const aladinEBookIdNumber = store.state.ALADIN_EBOOK_ID_NUMBER;
const yes24EBookIdNumber = store.state.YES_24_EBOOK_ID_NUMBER;
const kyoboEBookIdNumber = store.state.KYOBO_EBOOK_ID_NUMBER;
const milliEBookIdNumber = store.state.MILLI_EBOOK_ID_NUMBER;


const GITA_HEADER_STRING = "NO,,매출일자,구분,위치,서점코드,서  점  명,도서코드,도   서    명,과세구분,ISBN,정가,부수,%,금   액,비고";
const YES_24_HEADER_STRING = "순위,상품번호,상품명,관리분류,유통상태,제조사,ISBN10,ISBN13,바코드,기간중판매량,기간중 매출액,전월판매량,당월판매량,남성비중,여성비중,PC,MOBILE,eBook Reader";
const KYOBO_HEADER_STRING = "ISBN,상품명,출판일자,저자,출판사,정가,판매";
const YOUNGPOONG_HEADER_STRING = "바코드,도서명,정가,저자,출판사명,자재그룹내역,판매수량,발행일,과세구분";
const ALADIN_EBOOK_HEADER_STRING = "발주일,고객(기관명),도서명,저자,출판사,공급사,ItemId,CID,카피수,정가,정가합,입고율,정산액";
const YES_24_EBOOK_HEADER_STRING = "도서명,총 판매건수,총 정산액,B2C 판매건수,B2C 정산금액,B2B 판매건수,B2B 정산금액,B2BC 판매건수,B2BC 정산금액";

const isLoading = ref(false);
const isSuccess = ref(false);
const errorMessage = ref("");

const bookStoreExcelKeyAndName = computed(
    () => store.state.bookStoreExcelKeyAndName,
);
const bookStores = computed(() => store.state.bookStores);
const books = computed(() => store.state.books);

onMounted(async () => {
  await store.dispatch("fetchBookStores");
  await store.dispatch("fetchBookStoreExcelKeyAndName");
  await store.dispatch("fetchBooks");
});


const triggerFileInput = () => {
  document.getElementById("fileInput").click();
};

const onChange = (event) => {
  const uploadedFile = event.target.files[0];
  if (!uploadedFile) {
    alert("파일을 선택해주세요.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, {type: 'array'});
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, {header: 1});
    tempCollection.value = json;
    console.log(json);
    checkDb(json); // 데이터 처리 함수, 적절히 구현 필요
  };
  reader.readAsArrayBuffer(uploadedFile);
  file.value = uploadedFile;
  fileKey.value = Date.now(); // 파일 변경 감지를 위해 key 업데이트
};

// const onChange = (event) => {
//   salesData.value = [];
//   const uploadedFile = event.target.files[0];
//   if (
//     uploadedFile &&
//     (uploadedFile.name.endsWith(".xlsx") || uploadedFile.name.endsWith(".xls"))
//   ) {
//     file.value = uploadedFile;
//     console.log(uploadedFile);
//     jsonKey.value++;
//   } else {
//     alert("파일 확장자를 확인하세요(.xlsx, .xls 등)");
//   }
// };

const addBookStoreExcelKeyAndName = async () => {
  if (bookStoreExcelKeyAndName.value) {
    await store.dispatch("addBookStoreExcelKeyAndName", {
      bookStoreExcelKeyAndName: {
        bookStore: toRaw(bookStoreExcelKeyAndName.value.bookStore),
        headers: tempHeaders.value,
      },
    });
    await store.dispatch("fetchBookStoreExcelKeyAndName");
    processSwitch.value = 3;
  } else {
    alert("서점 이름을 입력하세요.");
  }
};
const checkDb = (value) => {
  nextTick(() => {
    setTimeout(() => {
      if (value !== null) {
        const headers = value[0].toString();
        console.log(headers);
        if (
            (!bookStoreExcelKeyAndName.value.length && headers) ||
            !bookStoreExcelKeyAndName.value.find(
                (bookStoreExcel) => bookStoreExcel.headers === headers,
            )
        ) {
          processSwitch.value = 2;
        } else {
          processSwitch.value = 3;
        }
        tempHeaders.value = headers;
      }
    });
  });
};

function excelSerialDateToJSDate(excelSerialDate) {
  const daysBeforeUnixEpoch = 70 * 365 + 19;

  const hour = 60 * 60 * 1000;

  return new Date(
      Math.round((excelSerialDate - daysBeforeUnixEpoch) * 24 * hour) + 12 * hour,
  );
}

function getQuarterFromDate(date) {
  const month = date.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
  return Math.ceil(month / 3);
}

const getQuarter = (item, dateIndex) => {
  const saleDate = excelSerialDateToJSDate(item[dateIndex]);
  const quarter = getQuarterFromDate(saleDate); // 분기 계산
  const year = saleDate.getFullYear(); // 년도 추출
  return `${year}-${quarter}`;
};

function handlePaste(event) {
  salesData.value = [];
  const paste = event.clipboardData || window.clipboardData;
  const text = paste.getData("text");

  const lines = text.trim().split("\n");
  const bookStore = store.state.bookStores.find(
      (obj) => obj.idNumber === aladinIdNumber,
  );
  lines.forEach((line) => {
    const items = line.split("\t");
    const sale = {
      quantity: parseInt(items[4]),
      quarter: inputQuarter.value,
      bookStore: toRaw(bookStore),
      ISBN: items[1],
    };
    salesData.value.push(sale);
  });
  console.log(salesData.value);
  event.preventDefault();
  // 모달을 닫습니다.
  closeModal();
}


function closeModal() {
  showAladinInputModal.value = false;
  inputQuarter.value = ""; // 모달을 닫을 때 분기 입력 필드 초기화
}

const gitaSalesAdd = async () => {
  if (tempHeaders.value === GITA_HEADER_STRING) {
    const bookStore = store.state.bookStores.find(
        (obj) => obj.idNumber === gitaIdNumber,
    );
    const dateIndex = tempCollection.value[0].indexOf("매출일자");
    const quantityIndex = tempCollection.value[0].indexOf("부수");
    const isbnIndex = tempCollection.value[0].indexOf("ISBN");
    for (const i of tempCollection.value.slice(1)) {
      const quarter = getQuarter(i, dateIndex);
      let amount = "";
      for (const key in i) {
        if (key.includes("금") && key.includes("액")) {
          amount = i[key];
        }
      }
      const sale = {
        ISBN: i[isbnIndex],
        quantity: i[quantityIndex],
        quarter: quarter,
        bookStore: toRaw(bookStore),
      };
      await store.dispatch("addSale", {
        sale: sale,
      });
      await store.dispatch("fetchBookStoreExcelKeyAndName");
    }
  }
};


const checkExist = async (bookStoreIdNumber, selectedYearQuarter) => {
  const existingData = await store.dispatch("fetchSalesData", {
    bookStoreId: bookStoreIdNumber,
    yearQuarter: selectedYearQuarter,
  });
  if (existingData.length > 0) {
    // 중복 데이터 발견
    throw new Error(
        `이미 데이터가 업로드되었습니다: 서점 ID ${bookStoreIdNumber}, 년도/분기 ${selectedYearQuarter}`,
    );
  }
};

const checkExistEBook = async (bookStoreIdNumber, selectedYearQuarter) => {
  const existingData = await store.dispatch("fetchSalesDataEBook", {
    bookStoreId: bookStoreIdNumber,
    yearQuarter: selectedYearQuarter,
  });
  console.log(existingData);
  if (existingData.length > 0) {
    // 중복 데이터 발견
    throw new Error(
        `이미 데이터가 업로드되었습니다: 서점 ID ${bookStoreIdNumber}, 년도/분기 ${selectedYearQuarter}`,
    );
  }
};

const yes24SalesAdd = async (bookStoreIdNumber, quarter) => {
  if (tempHeaders.value === YES_24_HEADER_STRING) {
    const bookStore = store.state.bookStores.find(
        (obj) => obj.idNumber === yes24IdNumber,
    );
    for (const i of tempCollection.value.slice(1)) {
      if (i.length > 0) {
        const sale = {
          ISBN: i[7],
          quantity: i[9],
          quarter: quarter,
          bookStore: toRaw(bookStore),
        };
        await store.dispatch("addSale", {
          sale: sale,
        });
      }
    }
  }
};

const kyoboSalesAdd = async (bookStoreIdNumber, quarter) => {
  if (tempHeaders.value === KYOBO_HEADER_STRING) {
    const bookStore = store.state.bookStores.find(
        (obj) => obj.idNumber === kyoboIdNumber,
    );
    for (const i of tempCollection.value.slice(1)) {
      const sale = {
        ISBN: i[0],
        quantity: i[6],
        quarter: quarter,
        bookStore: toRaw(bookStore),
      };
      await store.dispatch("addSale", {
        sale: sale,
      });
      await store.dispatch("fetchBookStoreExcelKeyAndName");
    }
  }
};

const youngpoongSalesAdd = async (bookStoreIdNumber, quarter) => {
  if (tempHeaders.value === YOUNGPOONG_HEADER_STRING) {
    const bookStore = store.state.bookStores.find(
        (obj) => obj.idNumber === youngpoongIdNumber,
    );
    for (const i of tempCollection.value.slice(1)) {
      const sale = {
        ISBN: i[0],
        quantity: i[6],
        quarter: quarter,
        bookStore: toRaw(bookStore),
      };
      await store.dispatch("addSale", {
        sale: sale,
      });
      await store.dispatch("fetchBookStoreExcelKeyAndName");
    }
  }
};

const addAladinSale = async () => {
  isLoading.value = true; // 로딩 시작
  isSuccess.value = false; // 초기 상태 재설정
  errorMessage.value = ""; // 초기 상태 재설정

  try {
    const existingData = await store.dispatch("fetchSalesData", {
      bookStoreId: aladinIdNumber,
      yearQuarter: inputQuarter.value,
    });
    if (existingData.length > 0) {
      // 중복 데이터 발견
      throw new Error(
          `이미 데이터가 업로드되었습니다: 서점 ID ${aladinIdNumber}, 년도/분기 ${inputQuarter.value}`,
      );
    }
    for (const i of salesData.value) {
      await store.dispatch("addSale", {
        sale: toRaw(i),
      });
    }
    await store.dispatch("fetchBookStoreExcelKeyAndName");
    isSuccess.value = true;
    alert("데이터가 성공적으로 업로드되었습니다."); // 성공 알림
    salesData.value = [];
  } catch (error) {
    // 에러 피드백 설정
    console.log(error);
    errorMessage.value = `오류가 발생했습니다: ${error.message}`;
    alert(errorMessage.value); // 에러 알림
  } finally {
    isLoading.value = false; // 로딩 종료
  }
};

const addSaleByBookStore = async () => {
  isLoading.value = true; // 로딩 시작
  isSuccess.value = false; // 초기 상태 재설정
  errorMessage.value = ""; // 초기 상태 재설정
  try {
    switch (tempHeaders.value) {
      case GITA_HEADER_STRING:
        const dateIndex = tempCollection.value[0].indexOf("매출일자");
        const quarter = getQuarter(tempCollection.value[1], dateIndex);
        await checkExist(gitaIdNumber, quarter);
        await gitaSalesAdd(gitaIdNumber, dateIndex);
        break;
      case YES_24_HEADER_STRING:
        await checkExist(yes24IdNumber, inputQuarter.value);
        await yes24SalesAdd(yes24IdNumber, inputQuarter.value);
        break;
      case KYOBO_HEADER_STRING:
        await checkExist(kyoboIdNumber, inputQuarter.value);
        await kyoboSalesAdd(kyoboIdNumber, inputQuarter.value);
        break;
      case YOUNGPOONG_HEADER_STRING:
        await checkExist(youngpoongIdNumber, inputQuarter.value);
        await youngpoongSalesAdd(youngpoongIdNumber, inputQuarter.value);
        break;
      case ALADIN_EBOOK_HEADER_STRING:
        await checkExistEBook(aladinEBookIdNumber, inputQuarter.value);
        await addAladinEBookSales();
        break;
      case YES_24_EBOOK_HEADER_STRING:
        await checkExistEBook(yes24EBookIdNumber, inputQuarter.value);
        await addYes24EBookSales(inputQuarter.value);
        break;
    }
    isSuccess.value = true;
    alert("데이터가 성공적으로 업로드되었습니다."); // 성공 알림
  } catch (error) {
    // 에러 피드백 설정
    console.log(error);
    errorMessage.value = `오류가 발생했습니다: ${error.message}`;
    alert(errorMessage.value); // 에러 알림
  } finally {
    isLoading.value = false; // 로딩 종료
  }
};

const addYes24EBookSales = async (quarter) => {
  if (tempHeaders.value === YES_24_EBOOK_HEADER_STRING) {
    const bookStore = store.state.bookStores.find(
        (obj) => obj.idNumber === yes24EBookIdNumber,
    );
    for (const i of tempCollection.value.slice(1, -1)) {
      const title = findISBNByBookTitle(i[0], true);
      if (title) {
        const sale = {
          ISBN: findISBNByBookTitle(i[0], true),
          amount: i[2],
          quarter: quarter,
          bookStore: toRaw(bookStore),
        };
        await store.dispatch("addSaleEBook", {
          sale: sale,
        });
      }
      await store.dispatch("fetchBookStoreExcelKeyAndName");
    }
  }
};

const addAladinEBookSales = async () => {
  if (tempHeaders.value === ALADIN_EBOOK_HEADER_STRING) {
    const bookStore = store.state.bookStores.find(
        (obj) => obj.idNumber === aladinEBookIdNumber,
    );
    const dateIndex = tempCollection.value[0].indexOf("발주일");
    const amountIndex = tempCollection.value[0].indexOf("정산액");
    const titleIndex = tempCollection.value[0].indexOf("도서명");
    for (const i of tempCollection.value.slice(1)) {
      const quarter = getQuarter(i, dateIndex);
      const ISBN = findISBNByBookTitle(i[titleIndex], true);
      const sale = {
        ISBN,
        amount: i[amountIndex],
        quarter: quarter,
        bookStore: toRaw(bookStore),
      };
      if (ISBN) {
        await store.dispatch("addSaleEBook", {
          sale: sale,
        });
      }
    }
  }
};

const findISBNByBookTitle = (title, isEbook) => {
  const targetBook = books.value.filter((book) => similarityByPrefix(book.title, title) > 60);
  if (targetBook.length > 1) {
    throw new Error("유사도가 높은 책이 2권 이상 발견");
  } else if (targetBook.length === 1) {
    return isEbook ? targetBook[0].isbnEBook : targetBook[0].isbnPaper;
  }
};

</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #f8f9fa;
}

h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.data-table th,
.data-table td {
  padding: 0.5rem;
  border: 1px solid #e9ecef;
}

.data-table th {
  background-color: #f1f3f5;
  font-weight: bold;
}

input[type="file"] {
  display: block;
  margin: 0 auto;
}

.btn {
  margin: 0.5rem 0;
}

.form-select {
  margin: 0.5rem 0;
}

.table {
  width: 100%;
  margin-top: 1rem;
  border-collapse: collapse;
}

.table th,
.table td {
  border: 1px solid #dee2e6;
  padding: 0.75rem;
  text-align: left;
}

.table thead th {
  vertical-align: bottom;
  border-bottom: 2px solid #dee2e6;
}

.table tbody + tbody {
  border-top: 2px solid #dee2e6;
}

.form-control {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}

.btn-success {
  color: #fff;
  background-color: #28a745;
  border-color: #28a745;
}

/* 추가적인 스타일... */
.loading-indicator {
  color: #007bff;
}

.alert-success {
  color: #155724;
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

.modal {
  display: block; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

.modal-dialog {
  position: relative;
  margin: 10% auto; /* 10% from the top and centered */
  padding: 20px;
  width: 80%; /* Could be more or less, depending on screen size */
  background-color: #fefefe;
  border-radius: 5px;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #f8f9fa;
}

h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.data-table th,
.data-table td {
  padding: 0.5rem;
  border: 1px solid #e9ecef;
}

.data-table th {
  background-color: #f1f3f5;
  font-weight: bold;
}

input[type="file"] {
  display: block;
  margin: 0 auto;
}

.btn {
  margin: 0.5rem 0;
}

.table {
  width: 100%;
  margin-top: 1rem;
  border-collapse: collapse;
}

.table th,
.table td {
  border: 1px solid #dee2e6;
  padding: 0.75rem;
  text-align: left;
}

.table thead th {
  vertical-align: bottom;
  border-bottom: 2px solid #dee2e6;
}

.table tbody + tbody {
  border-top: 2px solid #dee2e6;
}

.form-control {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}

.btn-success {
  color: #fff;
  background-color: #28a745;
  border-color: #28a745;
}

/* 추가적인 스타일... */
.loading-indicator {
  color: #007bff;
}

.alert-success {
  color: #155724;
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}
</style>
