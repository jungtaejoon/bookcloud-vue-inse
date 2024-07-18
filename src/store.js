import { createStore } from "vuex";
import { getDB } from './db';

// Helper function to handle IndexedDB operations
const performIndexedDBOperation = async (storeName, operationType, data) => {
  const db = await getDB();
  if (!db) {
    throw new Error("DB is not initialized yet");
  }
  const mode = operationType === "delete" || "put" || "add" ? "readwrite" : "readonly";
  const transaction = db.transaction([storeName], mode);
  const objectStore = transaction.objectStore(storeName);

  return await new Promise((resolve, reject) => {
    let request;
    if (operationType === "add") {
      request = objectStore.add(data);
    } else if (operationType === "put") {
      request = objectStore.put(data);
    } else if (operationType === "delete") {
      request = objectStore.delete(data);
    } else {
      request = data ? objectStore.get(data) : objectStore.getAll();
    }
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const store = createStore({
  state: {
    authors: [],
    authorPayments: [],
    books: [],
    bookStores: [],
    sales: [],
    ebookSales:[],
    authorRoyalties: [],
    authorContracts: [],
    debts: [],
  },
  mutations: {
    SET_AUTHORS(state, authors) { state.authors = authors; },
    SET_BOOKS(state, books) { state.books = books; },
    SET_AUTHOR_CONTRACTS(state, authorContracts) { state.authorContracts = authorContracts; },
    SET_BOOK_STORES(state, bookStores) { state.bookStores = bookStores; },
    SET_BOOK_STORE_EXCEL_KEY_AND_NAME(state, bookStoreExcelKeyAndName) { state.bookStoreExcelKeyAndName = bookStoreExcelKeyAndName; },
    SET_AUTHOR_ROYALTIES(state, authorRoyalties) { state.authorRoyalties = authorRoyalties; },
    SET_SALES(state, sales) { state.sales = sales; },
    SET_EBOOK_SALES(state, ebookSales) { state.ebookSales = ebookSales; },
    SET_AUTHOR_PAYMENTS(state, payments) { state.authorPayments = payments; },
    SET_DEBTS(state, debts) { state.debts = debts; },
  },
  actions: {
    async updateAuthor({ commit }, { author }) {
      try {
        await performIndexedDBOperation("authors", "put", author);
      } catch (error) {
        console.error("Error updating author:", error);
      }
    },
    async fetchAuthors({ commit }) {
      try {
        const authors = await performIndexedDBOperation("authors", "fetch");
        commit("SET_AUTHORS", authors);
      } catch (error) {
        console.error("Error fetching authors:", error);
      }
    },
    async addAuthor({ commit }, { author }) {
      try {
        await performIndexedDBOperation("authors", "add", author);
      } catch (error) {
        console.error("Error adding author:", error);
      }
    },
    async deleteAuthor({ commit }, { author }) {
      try {
        await performIndexedDBOperation("authors", "delete", author.id);
      } catch (error) {
        console.error("Error deleting author:", error);
      }
    },
    async fetchBooks({ commit }) {
      try {
        const books = await performIndexedDBOperation("books", "fetch");
        commit("SET_BOOKS", books);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    },
    async addBook({ commit }, book) {
      try {
        await performIndexedDBOperation("books", "add", book);
      } catch (error) {
        console.error("Error adding book:", error);
      }
    },
    async updateBook({ commit }, book) {
      try {
        await performIndexedDBOperation("books", "put", book);
      } catch (error) {
        console.error("Error updating book:", error);
      }
    },
    async deleteBook({ commit }, bookId) {
      try {
        await performIndexedDBOperation("books", "delete", bookId);
      } catch (error) {
        console.error("Error deleting book:", error);
      }
    },
    async fetchAuthorContracts({ commit }) {
      try {
        const authorContracts = await performIndexedDBOperation("authorContracts", "fetch");
        commit("SET_AUTHOR_CONTRACTS", authorContracts);
      } catch (error) {
        console.error("Error fetching author contracts:", error);
      }
    },
    async addAuthorContract({ commit }, authorContract) {
      try {
        await performIndexedDBOperation("authorContracts", "add", authorContract);
      } catch (error) {
        console.error("Error adding author contract:", error);
      }
    },
    async updateAuthorContract({ commit }, authorContract) {
      try {
        await performIndexedDBOperation("authorContracts", "put", authorContract);
      } catch (error) {
        console.error("Error updating author contract:", error);
      }
    },
    async deleteAuthorContract({ commit }, authorContractId) {
      try {
        await performIndexedDBOperation("authorContracts", "delete", authorContractId);
      } catch (error) {
        console.error("Error deleting author contract:", error);
      }
    },
    async fetchBookStores({ commit }) {
      try {
        const bookStores = await performIndexedDBOperation("bookStores", "fetch");
        commit("SET_BOOK_STORES", bookStores);
      } catch (error) {
        console.error("Error fetching book stores:", error);
      }
    },
    async addBookStore({ commit }, { bookStore }) {
      try {
        await performIndexedDBOperation("bookStores", "add", bookStore);
      } catch (error) {
        console.error("Error adding book store:", error);
      }
    },
    async updateBookStore({ commit }, { bookStore }) {
      try {
        await performIndexedDBOperation("bookStores", "put", bookStore);
      } catch (error) {
        console.error("Error updating book store:", error);
      }
    },
    async deleteBookStore({ commit }, { bookStoreId }) {
      try {
        await performIndexedDBOperation("bookStores", "delete", bookStoreId);
      } catch (error) {
        console.error("Error deleting book store:", error);
      }
    },
    async fetchBookStoreExcelKeyAndName({ commit }) {
      try {
        const bookStoreExcelKeyAndName = await performIndexedDBOperation("bookStoreExcelKeyAndName", "fetch");
        commit("SET_BOOK_STORE_EXCEL_KEY_AND_NAME", bookStoreExcelKeyAndName);
      } catch (error) {
        console.error("Error fetching book store excel key and name:", error);
      }
    },
    async addBookStoreExcelKeyAndName({ commit }, { bookStoreExcelKeyAndName }) {
      try {
        await performIndexedDBOperation("bookStoreExcelKeyAndName", "add", bookStoreExcelKeyAndName);
      } catch (error) {
        console.error("Error adding book store excel key and name:", error);
      }
    },
    async fetchSalesData({ commit }, { bookStoreId, yearQuarter }) {
      try {
        const db = await getDB();
        if (!db) {
          console.error("DB is not initialized yet");
          return;
        }
        const transaction = db.transaction(["sales"]);
        const objectStore = transaction.objectStore("sales");
        const index = objectStore.index("by_quarter");

        // 필터링된 데이터 반환
        return await new Promise((resolve, reject) => {
          // 모든 판매 데이터를 조회
          const request = index.getAll(yearQuarter);
          request.onsuccess = (e) => {
            const filteredSales = e.target.result.filter(sale => sale.bookStore.idNumber === bookStoreId);
            resolve(filteredSales);
          };
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    },
    async fetchSalesDataEBook({ commit }, { bookStoreId, yearQuarter }) {
      try {
        const db = await getDB();
        if (!db) {
          console.error("DB is not initialized yet");
          return;
        }
        const transaction = db.transaction(["ebookSales"]);
        const objectStore = transaction.objectStore("ebookSales");
        const index = objectStore.index("by_quarter");

        // 필터링된 데이터 반환
        return await new Promise((resolve, reject) => {
          // 모든 판매 데이터를 조회
          const request = index.getAll(yearQuarter);
          request.onsuccess = (e) => {
            const filteredSales = e.target.result.filter(sale => sale.bookStore.idNumber === bookStoreId);
            resolve(filteredSales);
          };
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error("Error fetching ebook sales data:", error);
      }
    },
    async addSale({ commit }, { sale }) {
      try {
        await performIndexedDBOperation("sales", "add", sale);
      } catch (error) {
        console.error("Error adding sale:", error);
      }
    },
    async addSaleEBook({ commit }, { sale }) {
      try {
        await performIndexedDBOperation("ebookSales", "add", sale);
      } catch (error) {
        console.error("Error adding ebook sale:", error);
      }
    },
    async updateSale({ commit }, { sale }) {
      try {
        await performIndexedDBOperation("sales", "put", sale);
      } catch (error) {
        console.error("Error updating sale:", error);
      }
    },
    async deleteSale({ commit }, { saleId }) {
      try {
        await performIndexedDBOperation("sales", "delete", saleId);
      } catch (error) {
        console.error("Error deleting sale:", error);
      }
    },
    async fetchSales({ commit }) {
      try {
        const sales = await performIndexedDBOperation("sales", "fetch");
        commit("SET_SALES", sales);
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    },
    async fetchEBookSales({ commit }) {
      try {
        const ebookSales = await performIndexedDBOperation("ebookSales", "fetch");
        commit("SET_EBOOK_SALES", ebookSales);
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    },
    async addAuthorRoyalty({ commit }, authorRoyalty) {
      try {
        await performIndexedDBOperation("authorRoyalties", "add", authorRoyalty);
      } catch (error) {
        console.error("Error adding author royalty:", error);
      }
    },
    async updateAuthorRoyalty({ commit }, authorRoyalty) {
      try {
        await performIndexedDBOperation("authorRoyalties", "put", authorRoyalty);
      } catch (error) {
        console.error("Error updating author royalty:", error);
      }
    },
    async fetchAuthorRoyalties({ commit }) {
      try {
        const authorRoyalties = await performIndexedDBOperation("authorRoyalties", "fetch");
        commit("SET_AUTHOR_ROYALTIES", authorRoyalties);
      } catch (error) {
        console.error("Error fetching author royalties:", error);
      }
    },
    async getRoyaltyByQAB({ commit }, key) {
      try {
        const db = await getDB();
        if (!db) {
          console.error("DB is not initialized yet");
          return;
        }
        const transaction = db.transaction(["authorRoyalties"]);
        const objectStore = transaction.objectStore("authorRoyalties");
        const index = objectStore.index("by_qab");

        return await new Promise((resolve, reject) => {
          const request = index.get(key);
          request.onsuccess = (event) => resolve(event.target.result);
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error("Error getting royalty by QAB:", error);
      }
    },
    async getRoyaltiesByQuarter({ commit }, key) {
      try {
        const db = await getDB();
        if (!db) {
          console.error("DB is not initialized yet");
          return;
        }
        const transaction = db.transaction(["authorRoyalties"]);
        const objectStore = transaction.objectStore("authorRoyalties");
        const index = objectStore.index("by_quarter");

        return await new Promise((resolve, reject) => {
          const request = index.getAll(key);
          request.onsuccess = (event) => resolve(event.target.result);
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error("Error getting royalties by quarter:", error);
      }
    },
    async savePayment({ commit }, payment) {
      try {
        await performIndexedDBOperation("authorPayments", "add", payment);
      } catch (error) {
        console.error("Error saving payment:", error);
      }
    },
    async deletePayment({ commit }, paymentId) {
      try {
        await performIndexedDBOperation("authorPayments", "delete", paymentId);
      } catch (error) {
        console.error("Error deleting payment:", error);
      }
    },
    async getAuthorPaymentsByAb({ commit }, ab) {
      try {
        const db = await getDB();
        if (!db) {
          console.error("DB is not initialized yet");
          return;
        }
        const transaction = db.transaction(["authorPayments"]);
        const objectStore = transaction.objectStore("authorPayments");
        const index = objectStore.index("by_ab");

        return await new Promise((resolve, reject) => {
          const request = index.getAll(ab);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error("Error getting author payments by AB:", error);
      }
    },
    async fetchAuthorPayments({ commit }) {
      try {
        const authorPayments = await performIndexedDBOperation("authorPayments", "fetch");
        commit("SET_AUTHOR_PAYMENTS", authorPayments);
      } catch (error) {
        console.error("Error fetching author payments:", error);
      }
    },
    async saveDebt({ commit }, debt) {
      try {
        return await performIndexedDBOperation("debts", "add", debt);
      } catch (error) {
        console.error("Error saving debt:", error);
      }
    },
    async deleteDebt({ commit }, debtId) {
      try {
        await performIndexedDBOperation("debts", "delete", debtId);
      } catch (error) {
        console.error("Error deleting debt:", error);
      }
    },
    async getDebt({ commit }, debtId) {
      try {
        return await performIndexedDBOperation("debts", "get", debtId);
      } catch (error) {
        console.error("Error getting debt:", error);
      }
    },
    async getDebtsByAb({ commit }, ab) {
      try {
        const db = await getDB();
        if (!db) {
          console.error("DB is not initialized yet");
          return;
        }
        const transaction = db.transaction(["debts"]);
        const objectStore = transaction.objectStore("debts");
        const index = objectStore.index("by_ab");

        return await new Promise((resolve, reject) => {
          const request = index.getAll(ab);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error("Error getting debts by AB:", error);
      }
    },
    async fetchDebts({ commit }) {
      try {
        const debts = await performIndexedDBOperation("debts", "fetch");
        commit("SET_DEBTS", debts);
      } catch (error) {
        console.error("Error fetching debts:", error);
      }
    },
  },
});
