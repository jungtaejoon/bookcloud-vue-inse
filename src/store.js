import {createStore} from "vuex";
import {getDB} from './db';

export const store = createStore({
  state: {
    authors: [],
    authorPayments: [],
    books: [],
    bookStores: [],
    sales: [],
    authorContracts: [],
  },
  mutations: {
    ADD_AUTHOR(state, author) {
      state.authors.push(author);
    },
    SET_AUTHORS(state, authors) {
      state.authors = authors;
    },
    UPDATE_AUTHOR(state, payload) {
      state.authors[payload.index] = payload.author;
    },
    ADD_BOOK(state, book) {
      state.books.push(book);
    },
    SET_BOOKS(state, books) {
      state.books = books;
    },
    UPDATE_BOOK(state, payload) {
      state.books[payload.index] = payload.book;
    },
    ADD_AUTHOR_CONTRACT(state, authorContract) {
      state.authorContracts.push(authorContract)
    },
    SET_AUTHOR_CONTRACTS(state, authorContracts) {
      state.authorContracts = authorContracts;
    },
    UPDATE_AUTHOR_CONTRACT(state, payload) {
      state.authorContracts[payload.index] = payload.authorContract;
    },
    SET_BOOK_STORES(state, bookStores) {
      state.bookStores = bookStores;
    },
    ADD_BOOK_STORE(state, bookStore) {
      state.bookStores.push(bookStore);
    },
    UPDATE_BOOK_STORE(state, updatedBookStore) {
      const index = state.bookStores.findIndex(
        (store) => store.id === updatedBookStore.id,
      );
      if (index !== -1) {
        state.bookStores.splice(index, 1, updatedBookStore);
      }
    },
    DELETE_BOOK_STORE(state, bookStoreId) {
      const index = state.bookStores.findIndex(
        (store) => store.id === bookStoreId,
      );
      if (index !== -1) {
        state.bookStores.splice(index, 1);
      }
    },
    SET_BOOK_STORE_EXCEL_KEY_AND_NAME(state, bookStoreExcelKeyAndName) {
      state.bookStoreExcelKeyAndName = bookStoreExcelKeyAndName;
    },
    ADD_SALES(state, sale) {
      state.sales.push(sale);
    },
    SET_SALES(state, sales) {
      state.sales = sales;
    },
    UPDATE_SALE(state, payload) {
      state.sales[payload.index] = payload.sale;
    },
    SET_AUTHOR_PAYMENTS(state, payments) {
      state.authorPayments = payments;
    },
  },
  actions: {
    async updateAuthor({ commit }, { author }) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["authors"], "readwrite");
      const objectStore = transaction.objectStore("authors");
      await new Promise((resolve, reject) => {
        const getRequest = objectStore.get(author.id);
        getRequest.onsuccess = () => {
          const updateRequest = objectStore.put(author);
          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => resolve(updateRequest.result);
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    },
    async fetchAuthors({ commit }) {
      const db = await getDB();
      if (!db) {
        console.error("DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["authors"]);
      const objectStore = transaction.objectStore("authors");
      const authors = await new Promise((resolve, reject) => {
        const request = objectStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      commit("SET_AUTHORS", authors);
    },
    async addAuthor({ commit }, { author }) {
      const db = await getDB();
      if (!db) {
        console.error("DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["authors"], "readwrite");
      const objectStore = transaction.objectStore("authors");
      await new Promise((resolve, reject) => {
        const request = objectStore.add(author);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      commit("ADD_AUTHOR", author);
    },
    async deleteAuthor({ commit }, { author }) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["authors"], "readwrite");
      const objectStore = transaction.objectStore("authors");
      await new Promise((resolve, reject) => {
        const getRequest = objectStore.get(author.id);
        getRequest.onsuccess = () => {
          const deleteRequest = objectStore.delete(author.id);
          deleteRequest.onerror = () => reject(deleteRequest.error);
          deleteRequest.onsuccess = () => resolve(deleteRequest.result);
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    },
    async fetchBooks({ commit }) {
      const db = await getDB();
      if (!db) {
        console.error("DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["books"]);
      const objectStore = transaction.objectStore("books");
      const books = await new Promise((resolve, reject) => {
        const request = objectStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      commit("SET_BOOKS", books);
    },
    async addBook({ commit }, book) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["books"], "readwrite");
      const objectStore = transaction.objectStore("books");
      await new Promise((resolve, reject) => {
        const request = objectStore.add(book);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    async updateBook({ commit }, book) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["books"], "readwrite");
      const objectStore = transaction.objectStore("books");
      await new Promise((resolve, reject) => {
        const getRequest = objectStore.get(book.id);
        getRequest.onsuccess = () => {
          const updateRequest = objectStore.put(book);
          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => resolve(updateRequest.result);
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    },
    async deleteBook({ commit }, bookId) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["books"], "readwrite");
      const objectStore = transaction.objectStore("books");
      await new Promise((resolve, reject) => {
        const getRequest = objectStore.get(bookId);
        getRequest.onsuccess = () => {
          const deleteRequest = objectStore.delete(bookId);
          deleteRequest.onerror = () => reject(deleteRequest.error);
          deleteRequest.onsuccess = () => resolve(deleteRequest.result);
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    },
    async fetchAuthorContracts({ commit }) {
      const db = await getDB();
      if (!db) {
        console.error("DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["authorContracts"]);
      const objectStore = transaction.objectStore("authorContracts");
      const books = await new Promise((resolve, reject) => {
        const request = objectStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      commit("SET_AUTHOR_CONTRACTS", books);
    },
    async addAuthorContract({ commit }, authorContract) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["authorContracts"], "readwrite");
      const objectStore = transaction.objectStore("authorContracts");
      await new Promise((resolve, reject) => {
        const request = objectStore.add(authorContract);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    async updateAuthorContract({ commit }, authorContract) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["authorContracts"], "readwrite");
      const objectStore = transaction.objectStore("authorContracts");
      await new Promise((resolve, reject) => {
        const getRequest = objectStore.get(authorContract.id);
        getRequest.onsuccess = () => {
          const updateRequest = objectStore.put(authorContract);
          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => resolve(updateRequest.result);
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    },
    async deleteAuthorContract({ commit }, authorContractId) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["authorContracts"], "readwrite");
      const objectStore = transaction.objectStore("authorContracts");
      await new Promise((resolve, reject) => {
        const getRequest = objectStore.get(authorContractId);
        getRequest.onsuccess = () => {
          const deleteRequest = objectStore.delete(authorContractId);
          deleteRequest.onerror = () => reject(deleteRequest.error);
          deleteRequest.onsuccess = () => resolve(deleteRequest.result);
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    },
    async fetchBookStores({ commit }) {
      const db = await getDB();
      if (!db) {
        console.error("DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["bookStores"]);
      const objectStore = transaction.objectStore("bookStores");
      const bookStores = await new Promise((resolve, reject) => {
        const request = objectStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      commit("SET_BOOK_STORES", bookStores);
    },
    async addBookStore({ commit }, { bookStore }) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["bookStores"], "readwrite");
      const objectStore = transaction.objectStore("bookStores");
      await new Promise((resolve, reject) => {
        const request = objectStore.add(bookStore);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    async updateBookStore({ commit }, { bookStore }) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["bookStores"], "readwrite");
      const objectStore = transaction.objectStore("bookStores");
      await new Promise((resolve, reject) => {
        const getRequest = objectStore.get(bookStore.id);
        getRequest.onsuccess = () => {
          const updateRequest = objectStore.put(bookStore);
          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => resolve(updateRequest.result);
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    },
    async deleteBookStore({ commit }, { bookStoreId }) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["bookStores"], "readwrite");
      const objectStore = transaction.objectStore("bookStores");
      await new Promise((resolve, reject) => {
        const getRequest = objectStore.get(bookStoreId);
        getRequest.onsuccess = () => {
          const deleteRequest = objectStore.delete(bookStoreId);
          deleteRequest.onerror = () => reject(deleteRequest.error);
          deleteRequest.onsuccess = () => resolve(deleteRequest.result);
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    },
    async fetchBookStoreExcelKeyAndName({ commit }) {
      const db = await getDB();
      if (!db) {
        console.error("DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["bookStoreExcelKeyAndName"]);
      const objectStore = transaction.objectStore("bookStoreExcelKeyAndName");
      const bookStoreExcelKeyAndName = await new Promise((resolve, reject) => {
        const request = objectStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      commit("SET_BOOK_STORE_EXCEL_KEY_AND_NAME", bookStoreExcelKeyAndName);
    },
    async addBookStoreExcelKeyAndName({ commit }, { bookStoreExcelKeyAndName }) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(
        ["bookStoreExcelKeyAndName"],
        "readwrite",
      );
      const objectStore = transaction.objectStore("bookStoreExcelKeyAndName");
      await new Promise((resolve, reject) => {
        const request = objectStore.add(bookStoreExcelKeyAndName);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    async fetchSalesData({ commit }, { bookStoreId, yearQuarter }) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["sales"]);
      const objectStore = transaction.objectStore("sales");
      // 필터링된 데이터 반환
      return await new Promise((resolve, reject) => {
        // 모든 판매 데이터를 조회
        const request = objectStore.getAll();
        request.onsuccess = () => {
          // 조회된 판매 데이터 중에서 특정 서점 ID와 년도/분기에 해당하는 데이터만 필터링
          const filteredSales = request.result.filter((sale) => {
            return (
                sale.bookStore.idNumber === bookStoreId &&
                sale.quarter === yearQuarter
            );
          });
          resolve(filteredSales);
        };
        request.onerror = () => reject(request.error);
      });
    },
    async addSale({ commit }, { sale }) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["sales"], "readwrite");
      const objectStore = transaction.objectStore("sales");
      await new Promise((resolve, reject) => {
        const request = objectStore.add(sale);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    async updateSale({ commit }, { sale }) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["sales"], "readwrite");
      const objectStore = transaction.objectStore("sales");
      await new Promise((resolve, reject) => {
        const getRequest = objectStore.get(sale.id);
        getRequest.onsuccess = () => {
          const updateRequest = objectStore.put(sale);
          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => resolve(updateRequest.result);
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    },
    async deleteSale({ commit }, { saleId }) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["sales"], "readwrite");
      const objectStore = transaction.objectStore("sales");
      await new Promise((resolve, reject) => {
        const getRequest = objectStore.get(saleId);
        getRequest.onsuccess = () => {
          const deleteRequest = objectStore.delete(saleId);
          deleteRequest.onerror = () => reject(deleteRequest.error);
          deleteRequest.onsuccess = () => resolve(deleteRequest.result);
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    },
    async fetchSales({ commit }) {
      const db = await getDB();
      if (!db) {
        console.error("DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["sales"]);
      const objectStore = transaction.objectStore("sales");
      const sales = await new Promise((resolve, reject) => {
        const request = objectStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      commit("SET_SALES", sales);
    },
    async addRoyalty({ commit }, royalty ) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["authorRoyalties"], "readwrite");
      const objectStore = transaction.objectStore("authorRoyalties");
      await new Promise((resolve, reject) => {
        const request = objectStore.add(royalty);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    async getRoyaltyByQAB({ commit }, key ) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["authorRoyalties"]);
      const objectStore = transaction.objectStore("authorRoyalties");
      const index = objectStore.index("by_qab");
      return await new Promise((resolve, reject) => {
        const request = index.get(key);
        request.onsuccess = (event) => {
          resolve(event.target.result);
        }
        request.onerror = () => reject(request.error);
      });
    },
    async savePayment({ commit }, { payment }) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["authorPayments"], "readwrite");
      const objectStore = transaction.objectStore("authorPayments");
      await new Promise((resolve, reject) => {
        const request = objectStore.add(payment);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    async deletePayment({ commit }, paymentId) {
      const db = await getDB();
      if (!db) {
        console.error(commit + "DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["authorPayments"], "readwrite");
      const objectStore = transaction.objectStore("authorPayments");
      await new Promise((resolve, reject) => {
        const getRequest = objectStore.get(paymentId);
        getRequest.onsuccess = () => {
          const deleteRequest = objectStore.delete(paymentId);
          deleteRequest.onerror = () => reject(deleteRequest.error);
          deleteRequest.onsuccess = () => resolve(deleteRequest.result);
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    },
    async fetchAuthorPayments({ commit }) {
      const db = await getDB();
      if (!db) {
        console.error("DB is not initialized yet");
        return;
      }
      const transaction = db.transaction(["authorPayments"]);
      const objectStore = transaction.objectStore("authorPayments");
      const payments = await new Promise((resolve, reject) => {
        const request = objectStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      commit("SET_AUTHOR_PAYMENTS", payments);
    },
  },
});
