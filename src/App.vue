<template>
  <v-app>
    <v-main class="main-container">
      <router-view />
      <div class="d-flex copyright align-center justify-center">
        <div class="d-flex align-center justify-center">
          <a href="https://wee.ar/" target="_blank">
            <img
              v-if="preferences"
              src="@/assets/wee_logo.png"
              width="50px"
              class="mx-1 image"
            />
          </a>
          <span>Desarrollado por</span>
          <a href="https://www.telco.com.ar/" target="_blank">
            <img src="@/assets/logo.png" height="21px" class="ml-1 image" />
          </a>
        </div>
        <span> Corrientes Telecomunicaciones S.A.P.E.M </span>
        <span class="ml-2 mt-3 mt-sm-0">v 1.0.0</span>
      </div>
    </v-main>
  </v-app>
</template>

<script>
require("./assets/main.css");
import { mapActions } from "vuex";
import { mapGetters } from "vuex";

export default {
  name: "App",

  data: () => ({
    //
  }),
  async created() {
    const id = this.$route.params.id;
    if (!id) return this.$toast.error("UUID NO VÁLIDO.");

    // verificando servicio de prisma
    await this.checkPrisma();
    await this.getCheckoutData(id);

    this.$options.sockets.onmessage = (data) => {
      const response = JSON.parse(data.data);

      const uuid = this.$route.params.id;

      if (uuid === response.data.uuid) this.pagarCheckout(response.data);
    };
  },

  watch: {
    preferences(newPreferences) {
      const container = document.getElementsByClassName("main-container")[0];

      if (newPreferences) {
        const { main_color, secondary_color } = newPreferences;

        this.$vuetify.theme.themes.light.primary = main_color.substring(0, 7);
        this.$vuetify.theme.themes.light.secondary = secondary_color.substring(
          0,
          7
        );

        container.classList.add("primary");
      }
    },
  },
  computed: {
    ...mapGetters(["preferences"]),
  },
  methods: {
    ...mapActions(["getCheckoutData", "checkPrisma", "pagarCheckout"]),
  },
};
</script>

<style>
html {
  font-family: "Montserrat";
}
.main-container {
  justify-content: center;
  align-items: center;
}
p {
  margin: 0 !important;
}

.copyright {
  font-family: "Montserrat";
  font-weight: 600;
  font-size: 16px;
  color: #fff;

  gap: 8px;

  margin-top: -15px;
}

/*RESPONSIVE  */
@media (max-width: 700px) {
  .main-container {
    padding: 0 10px !important;
  }
  .copyright {
    font-size: 13px;
    gap: 0px;

    margin-bottom: 20px;
  }
  .image {
    transform: scale(0.7);
  }
}

@media (max-width: 420px) {
  .image {
    transform: scale(0.5);
  }
  .copyright {
    font-size: 12px;
    line-height: 8px;
    flex-direction: column;
    text-align: justify;
  }
}
</style>
