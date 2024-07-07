const DB_NAME = "INSE";
const DB_VERSION = 6;
const AUTHORS_STRING = "authors";
const BOOKS_STRING = "books";
const BOOK_STORES_STRING = "bookStores";
const AUTHOR_PAYMENTS_STRING = "authorPayments";
const SALES_STRING = "sales";
const AUTHOR_CONTRACTS_STRING = "authorContracts";
const BOOK_STORE_EXCEL_KEY_AND_NAME_STRING = "bookStoreExcelKeyAndName";
const ROYALTIES_STRING = "authorRoyalties";

let dbInstance = null;

const initDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = function (e) {
      const db = e.target.result;

      if (!db.objectStoreNames.contains(AUTHORS_STRING)) {
        const authorsOS = db.createObjectStore(AUTHORS_STRING, {
          keyPath: "id",
          autoIncrement: true,
        });
        authorsOS.createIndex("by_name", "name");
        authorsOS.createIndex("by_idNumber", "idNumber");
      }

      if (!db.objectStoreNames.contains(BOOKS_STRING)) {
        const booksOS = db.createObjectStore(BOOKS_STRING, {
          keyPath: "id",
          autoIncrement: true,
        });
        booksOS.createIndex("by_title", "title");
        booksOS.createIndex("by_isbnPaper", "isbnPaper");
        booksOS.createIndex("by_isbnEbook", "isbnEbook");
      }

      if (!db.objectStoreNames.contains(AUTHOR_CONTRACTS_STRING)) {
        const authorContractsOS = db.createObjectStore(AUTHOR_CONTRACTS_STRING, {
          keyPath: "id",
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains(BOOK_STORES_STRING)) {
        const bookStoresOS = db.createObjectStore(BOOK_STORES_STRING, {
          keyPath: "id",
          autoIncrement: true,
        });
        bookStoresOS.createIndex("by_idNumber", "idNumber");
        bookStoresOS.createIndex("by_name", "name");
      }

      if (!db.objectStoreNames.contains(AUTHOR_PAYMENTS_STRING)) {
        db.createObjectStore(AUTHOR_PAYMENTS_STRING, {
          keyPath: "id",
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains(SALES_STRING)) {
        db.createObjectStore(SALES_STRING, { keyPath: "id", autoIncrement: true });
      }

      if (!db.objectStoreNames.contains(BOOK_STORE_EXCEL_KEY_AND_NAME_STRING)) {
        const bookStoreExcelKeyAndName = db.createObjectStore(
          BOOK_STORE_EXCEL_KEY_AND_NAME_STRING,
          {
            keyPath: "id",
            autoIncrement: true,
          },
        );
        bookStoreExcelKeyAndName.createIndex("by_headers", "headers");
      }

      if (!db.objectStoreNames.contains(ROYALTIES_STRING)) {
        const royalties = db.createObjectStore(
            ROYALTIES_STRING,
            {
              keyPath: "id",
              autoIncrement: true,
            },
        );
        royalties.createIndex("by_quarter_author_book", "quarterAuthorBook");
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('Database error:', event.target.errorCode);
      reject(event.target.error);
    };
  });
};

const getDB = () => {
  if (!dbInstance) {
    return initDB();
  }
  return Promise.resolve(dbInstance);
};

export { getDB };
