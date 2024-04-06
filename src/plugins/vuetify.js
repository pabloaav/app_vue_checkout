import Vue from "vue";
import Vuetify from "vuetify/lib/framework";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#00B1EB",
        secondary: "#c2d500",
        accent: "#8A8A8A",
        error: "#F44336",
        success: "#00BA00",
      },
    },
  },
});
