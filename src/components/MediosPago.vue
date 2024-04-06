<template>
  <v-row class="d-flex justify-center mt-8 medio-pago-container">
    <v-col
      cols="12"
      class="d-flex justify-space-between mb-1 title-container"
      style="padding: 0"
    >
      <p class="btn-costos title secondary--text">Seleccionar medio de pago:</p>
      <a class="btn-costos mr-3 secondary--text" @click="setDialogCostos(true)">
        ver costos
      </a>
    </v-col>

    <!--MEDIOS DE PAGO ITEM-->
    <v-col
      v-for="item in mediosPago"
      :key="item.type"
      v-if="payment?.included_channels.includes(item.type)"
      class="medio-pago__item d-flex justify-space-between align-center"
      cols="12"
      @click="seleccionarMedioPago(item.type)"
    >
      <p class="font-weight-bold" style="flex: 1">{{ item.name }}</p>
      <div
        class="d-flex align-center justify-end"
        v-for="(image, i) in item.images"
        :key="i"
      >
        <v-img :src="require(`@/assets/${image.file}`)" class="image"></v-img>
        <span
          class="font-weight-bold separador"
          v-if="i + 1 < item.images.length"
          >/
        </span>
      </div>
    </v-col>

    <v-alert
      text
      dense
      dismissible
      color="lime darken-3"
      icon="mdi-clock-fast"
      border="left"
      width="100%"
      class="mt-5"
      v-if="payment.second_due_date"
    >
      Usted está por pagar el segundo vencimiento
      <span class="font-weight-bold">{{ payment.due_date }}</span>
    </v-alert>
  </v-row>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
export default {
  name: "MediosPago",

  data: () => ({
    mediosPago: [
      {
        type: "DEBIT",
        name: "Tarjeta de Débito",
        images: [
          { file: "visa_logo.png", width: "106px", height: "31px" },
          { file: "mastercard_logo.png", width: "64px", height: "50px" },
          { file: "maestro_logo.png", width: "70px", height: "55px" },
          { file: "cabal_logo.png", width: "80px", height: "29px" },
        ],
      },
      {
        type: "CREDIT",
        name: "Tarjeta de Crédito",
        images: [
          { file: "visa_logo.png", width: "106px", height: "31px" },
          { file: "mastercard_logo.png", width: "64px", height: "50px" },
          { file: "express_logo.png", width: "47px", height: "49px" },
          { file: "naranja_logo.png", width: "41px", height: "54px" },
        ],
      },
      {
        type: "OFFLINE",
        name: "Efectivo",
        images: [
          { file: "rapipago_logo.png", width: "130px", height: "36px" },
          { file: "multipago_logo.jpg", width: "130px", height: "30px" },
        ],
      },
      {
        type: "DEBIN",
        name: "Debin",
        images: [{ file: "debin_logo.png", width: "77px", height: "48px" }],
      },
      {
        type: "QR",
        name: "QR",
        images: [{ file: "qr_logo.jpg", width: "55px", height: "55px" }],
      },
    ],
  }),
  computed: { ...mapGetters(["payment", "form", "preferences"]) },

  mounted() {
    if (this.preferences) {
      const items = document.getElementsByClassName("medio-pago__item");
      const secondary_color = this.$vuetify.theme.themes.light.secondary;

      for (let item of items) {
        item.style.borderColor = secondary_color;

        item.onmouseover = function () {
          this.style.backgroundColor = secondary_color + "0D";
        };

        item.onmouseout = function () {
          this.style.backgroundColor = "#fff";
        };
      }
    } else {
      // en caso de que el cliente no tenga preferencias se asigna un fondo por defecto
      const container = document.getElementsByClassName("main-container")[0];
      const backgroundUrl = require("@/assets/background_main.png");
      container.style.backgroundImage = `url('${backgroundUrl}')`;
      container.style.backgroundSize = "cover";
    }
  },

  methods: {
    ...mapActions(["setDialogCostos", "getTarjetas", "setForm"]),

    seleccionarMedioPago(type) {
      //si el medio de pago seleccioando es credito o debito obtenemos los datos de las tarjetas
      if (type === "CREDIT" || type === "DEBIT") this.getTarjetas(type);

      this.setForm({ ...this.form, channel: type.toLowerCase() });
    },
  },
};
</script>

<style scoped>
.medio-pago__item {
  border: 1px solid #c2d500;
  font-size: 18px;

  max-height: 55px;
  border-radius: 20px;
  margin-bottom: 14px;
  cursor: pointer;
}

.row {
  max-width: 700px;
  margin: auto;
}

.medio-pago__item:hover {
  background: #c2d5000d;
}

.btn-costos {
  text-decoration: none;
  font-weight: 700;
  font-size: 18px !important;
}

.title {
  font-weight: normal;
  letter-spacing: 1px !important;
}

.image {
  transform: scale(0.75);
}

/*RESPONSIVE*/

@media (max-width: 700px) {
  .image {
    transform: scale(0.57);
  }
  .medio-pago__item {
    font-size: 16px;
  }
}

@media (max-width: 555px) {
  .image {
    display: none;
  }
  .separador {
    display: none;
  }
  .medio-pago__item {
    border-radius: 23px;
  }

  .title-container {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-costos {
    font-size: 18px !important;
    align-self: flex-end;
  }

  .title {
    align-self: center;
  }
}

@media (max-width: 420px) {
  .medio-pago-container {
    margin-bottom: 50px;
  }
  .medio-pago__item {
    border-radius: 18px;
    margin-bottom: 10px;
  }

  .title {
    font-weight: 400;
  }
}
</style>
