import { createRouter, createWebHistory } from "vue-router";
import HomePage from "./components/HomePage.vue";
import AuthorList from "./components/AuthorList.vue";
import BookList from "./components/BookList.vue";
import BookStoreList from "./components/BookStoreList.vue";
import BookSalesParser from "./components/BookSalesParser.vue";
import AuthorRoyalties from "./components/AuthorRoyalties.vue";
import TotalRoyalties from "./components/TotalRoyalties.vue";
import AuthorPayment from "./components/AuthorPayment.vue";
import AuthorContracts from "./components/AuthorContracts.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/authors", component: AuthorList },
  { path: "/books", component: BookList },
  { path: "/author-contracts", component: AuthorContracts },
  { path: "/bookStores", component: BookStoreList },
  { path: "/book-sales-parser", component: BookSalesParser },
  { path: "/author-royalties", component: AuthorRoyalties },
  { path: "/total-royalties", component: TotalRoyalties },
  { path: "/author-payment", component: AuthorPayment },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
