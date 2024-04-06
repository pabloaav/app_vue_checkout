<template>
  <v-row class="header-container" no-gutters>
    <v-col class="d-flex flex-column align-center" cols="12">
      <img
        :src="
          !preferences?.logo
            ? require('@/assets/wee_logo.png')
            : `${rutaImagen}/imgs/logos/${preferences.logo}`
        "
        height="116"
        class="mb-4 mt-2"
        alt="Logo checkout"
      />
    </v-col>

    <v-col class="mb-4" cols="12">
      <div class="d-flex justify-center align-center steps-container">
        <div
          class="step primary rounded-circle"
          :class="payment.currentStep === 1 ? 'step-active' : ''"
        ></div>

        <v-divider
          :class="
            payment.currentStep === 2 || payment.currentStep === 3
              ? 'primary'
              : ''
          "
        />

        <div
          :class="
            payment.currentStep === 2
              ? 'step primary rounded-circle step-active'
              : payment.currentStep === 3
              ? 'step primary rounded-circle'
              : 'step accent rounded-circle'
          "
        ></div>
        <v-divider :class="payment.currentStep === 3 ? 'primary' : ''" />

        <div
          :class="
            payment.currentStep === 3
              ? 'step primary rounded-circle step-active'
              : 'step accent rounded-circle'
          "
        ></div>
      </div>
    </v-col>

    <v-col
      cols="12"
      class="d-flex flex-column justify-center align-center"
      v-if="payment.currentStep !== 3"
    >
      <div class="info-pay-container primary" width="660px">
        <p>
          Vas a pagar a
          <span class="font-weight-bold description">{{ cliente }}</span> la
          suma de:
        </p>
        <p class="price">{{ toPesos(payment.total) }}</p>
      </div>
      <div class="info-pay-container">
        <div style="flex: 1" class="d-flex justify-center justify-sm-start">
          <a
            class="btn-detalle secondary--text"
            @click="showCompartir = true"
            style="font-size: 13.7px"
          >
            compartir link
          </a>
        </div>
        <div style="flex: 1" class="d-flex justify-center justify-sm-end">
          <a
            class="btn-detalle secondary--text"
            @click="setDialogDetalle(true)"
          >
            ver detalles
          </a>
        </div>
      </div>
    </v-col>

    <v-icon
      class="btn-back"
      v-if="form.channel && !resultadoPago"
      @click="resetPago()"
      >mdi-chevron-left
    </v-icon>

    <TablaDetalle />

    <div class="compartir-container" v-if="showCompartir">
      <v-card class="card-container overflow-y-auto mx-5">
        <v-card-title
          class="title mt-4 mx-2 grey--text text--darken-4"
          style="
            font-weight: 500;
            text-align: center;
            font-family: 'Montserrat' !important;
          "
        >
          Compartir link de pago
        </v-card-title>

        <!-- <p class="primary--text text-center mb-3">COMPARTIR LINK DE PAGO</p> -->

        <div class="d-flex flex-column px-6 justify-center" style="gap: 20px">
          <v-btn text class="grey lighten-2" @click="enviarWhatsap()">
            <v-icon class="text-subtitle-1 mr-1">mdi-whatsapp</v-icon>
            Enviar
          </v-btn>
          <v-btn text class="grey lighten-2" @click="enviarEmail()">
            <v-icon class="text-subtitle-1 mr-1">mdi-email-outline</v-icon>
            Enviar
          </v-btn>
          <v-btn text class="grey lighten-2" @click="copiarPortapapeles()">
            <v-icon class="text-subtitle-1 mr-1">mdi-content-copy</v-icon>
            Copiar
          </v-btn>
        </div>

        <div class="d-flex justify-center mb-4">
          <v-btn
            class="mt-5 font-weight-bold"
            text
            @click="showCompartir = false"
          >
            Cerrar
          </v-btn>
        </div>
      </v-card>
    </div>
  </v-row>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { toPesos } from "@/helpers";
import TablaDetalle from "./TablaDetalle.vue";
export default {
  name: "CabeceraPago",
  components: { TablaDetalle },

  data: () => ({
    rutaImagen: process.env.VUE_APP_ROOT_PASARELA,
    showCompartir: false,
    toPesos,
  }),
  computed: {
    ...mapGetters([
      "form",
      "resultadoPago",
      "payment",
      "cliente",
      "preferences",
    ]),
  },
  methods: {
    ...mapActions(["resetPago", "setDialogDetalle"]),

    enviarWhatsap() {
      window.open("https://wa.me/?text=" + window.location.href, "_blank");
      this.showCompartir = false;
    },
    enviarEmail() {
      const message = "mailto:?subject=Pagos&body=" + window.location.href;
      window.open(message, "_blank");

      this.showCompartir = false;
    },
    copiarPortapapeles() {
      // Se necesita hacer esto para acceder dentro de la funcion a la data del component

      navigator.clipboard.writeText(window.location.href).then(
        () => this.$toast.success("Enlace copiado con éxito."),
        () => this.$toast.error("No se pudo copiar el enlace.")
      );

      this.showCompartir = false;
    },
  },
};
</script>

<style scoped>
.header-container > div {
  padding: 0 !important;
}

.steps-container {
  max-width: 600px;
  margin: -10px auto 10px;
  min-height: 28px;
}

.step {
  width: 16px;
  height: 16px;
  border: 0 !important;

  transition: 0.1s all;
}

.step-active {
  width: 24px;
  height: 24px;
}

.v-divider {
  position: relative;
  background: #8a8a8a;
  transition: 1s all;
  min-height: 4px;
}

.btn-detalle {
  text-decoration: none;

  font-size: 16px;
}

.image {
  transform: scale(0.9);
}

@keyframes progres {
  0% {
    width: 0%;
  }
  25% {
    width: 50%;
  }
  50% {
    width: 75%;
  }
  75% {
    width: 85%;
  }
  100% {
    width: 100%;
  }
}

.info-pay-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  border-radius: 50px;

  color: #fff;
  min-width: 660px;
  padding: 3px 20px;
}

.info-pay-container > .price {
  font-size: 21px;
  font-weight: 900;
}

.btn-back {
  position: absolute;
  left: 34px;
  top: 28px;
  font-size: 48px !important;
  color: #222;
  cursor: pointer;
}

@media (max-width: 700px) {
  .image {
    transform: scale(0.8);
  }
  .steps-container {
    margin: auto 60px;
  }
  .step {
    width: 18px;
    height: 18px;
  }
  .step-active {
    width: 24px;
    height: 24px;
  }
  .info-pay-container {
    flex-direction: column;
    min-width: 100%;
    text-align: justify;

    border-radius: 15px;
  }
}

@media (max-width: 420px) {
  .btn-back {
    left: 10px;
    top: 18px;
    font-size: 40px !important;
  }

  .image {
    transform: scale(0.7);
  }

  .steps-container {
    margin: auto 25px;
  }
  .step {
    width: 15px;
    height: 15px;
  }

  .step-active {
    width: 20px;
    height: 20px;
  }

  .v-divider {
    min-height: 3px;
  }
  .header-container {
    margin: 0px;
  }
  .info-pay-container {
    font-size: 18px;
    border-radius: 10px;
  }
}

.compartir-container {
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  background: rgb(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.card-container {
  width: 400px;
  max-width: 720px;
  border-radius: 30px;
}

.title {
  font-size: 18px !important;
}

.v-expansion-panel::before {
  box-shadow: none !important;
}

.btn-close {
  position: absolute;
  top: 0;
  right: 0;
}

@media (max-width: 420px) {
  .title {
    font-size: 16px !important;
  }
}
</style>
