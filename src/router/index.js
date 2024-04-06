import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "../views/HomeView.vue";
import PlantillaImprimir from "../views/PlantillaImprimir.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/checkout/:id",
    name: "home",
    component: HomeView,
  },
  {
    path: "/imprimir",
    name: "imprimir",
    component: PlantillaImprimir,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
