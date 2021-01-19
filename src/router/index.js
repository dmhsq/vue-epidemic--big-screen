import Vue from "vue";
import VueRouter from "vue-router";
import echartest from "../views/echartest";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: echartest
  }
];

const router = new VueRouter({
  mode:'history',
  routes
});

export default router;
