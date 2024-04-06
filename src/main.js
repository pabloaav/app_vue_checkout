import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import VueNativeSock from "vue-native-websocket";

Vue.use(VueNativeSock, process.env.VUE_APP_ROOT_WEBSOCKET, {
  reconnection: true, // (opcional) activa la reconexión automática
  reconnectionAttempts: 10, // (opcional) número máximo de intentos de reconexión
  reconnectionDelay: 3000, // (opcional) tiempo entre intentos de reconexión en milisegundos
});

Vue.config.productionTip = false;
Vue.use(Toast, { timeout: 6000 });

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
