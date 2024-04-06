<template>
  <div>
    <v-row>
      <v-col cols="12" class="medio-pago__title">
        <p class="text-center mt-3">
          {{ mostrarQR ? "ESCANEAR" : "PAGO CON" }} QR INTEROPERABLE
        </p>
      </v-col>
    </v-row>

    <!--FORMULARIO CONTAINER-->
    <v-form
      ref="debinForm"
      @submit.prevent="submitDebinForm"
      v-show="!mostrarQR"
    >
      <v-row class="medio-pago__form" no-gutters>
        <!--TITULAR-->
        <v-col cols="12"
          ><v-text-field
            label="Titular"
            v-model="form.holder_name"
            solo
            outlined
            color="black"
            dense
            :rules="rules.titular"
          ></v-text-field
        ></v-col>
        <v-col cols="2">
          <p class="mt-3 label-cuil">CUIL/CUIT</p>
        </v-col>

        <!--NUMERO DE IDENTIFICACION-->
        <v-col cols="12" sm="10"
          ><v-text-field
            label="Número de Identificación / Sin guiones"
            v-model="form.holder_cuit"
            type="number"
            min="0"
            counter="11"
            solo
            outlined
            color="black"
            :rules="rules.identificacion"
            dense
          ></v-text-field
        ></v-col>

        <!-- CORREO-->
        <v-col cols="12"
          ><v-text-field
            v-model="form.holder_email"
            label="Email"
            solo
            outlined
            color="black"
            dense
            :rules="rules.email"
          ></v-text-field
        ></v-col>
      </v-row>
      <div class="btn-container">
        <v-btn
          class="btn-submit secondary px-12"
          rounded
          type="submit"
          :loading="loadingPagar"
          >{{ loadingPagar ? "Procesando pago" : "Pagar" }}
          <template v-slot:loader>
            <div class="px-2">
              <span>Generando QR</span>
              <span class="loader-btn mx-1"></span>
            </div>
          </template>
        </v-btn>
      </div>
    </v-form>

    <div
      v-if="mostrarQR"
      class="d-flex flex-column align-center justify-center mt-4 mb-4"
    >
      <div class="qr-container" style="transform: scale(0.95)">
        <div></div>

        <img :src="'data:image/png;base64,' + QR" alt="QR" class="mx-1" />
      </div>

      <span class="mt-2">{{ tiempoRestante }}</span>

      <div class="d-flex justify-center">
        <div style="max-width: 90vw; width: 650px">
          <img
            src="@/assets/billeteras1.png"
            alt="logo de billeteras"
            class="mx-1"
            width="100%"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import checkoutService from "@/services/checkout";

export default {
  name: "QR",
  data() {
    return {
      cbu: true,
      alias: false,

      loadingPagar: false,

      rules: {
        email: [
          (v) => !!v || "El correo es requerido",
          (v) => /.+@.+\..+/.test(v) || "Ingrese un correo válido",
        ],
        titular: [
          (v) => !!v || "El titular es requerido",
          (v) =>
            (v && v.length <= 50) ||
            "El nombre debe tener menos de 50 caracteres",
        ],

        identificacion: [
          (v) => !!v || "Número de identificacion es requerido",
          (v) => /^\d+$/.test(v) || "Solo se permiten números",
          (v) => v.length === 11 || "El cuit debe contener 11 dígitos",
        ],
      },

      QR: "",

      fechaFin: null,
      tiempoRestante: "Calculando...",

      fetchQR: false,
      reintentosQR: 0,
    };
  },

  watch: {
    "form.holder_name"(newHolderName) {
      this.form.holder_name = newHolderName.toUpperCase();
    },
  },

  computed: {
    ...mapGetters(["payment", "payer", "mostrarQR", "resultadoPago"]),
    form: {
      get() {
        return this.$store.getters["form"];
      },
      set(newForm) {
        this.$store.dispatch("setForm", newForm);
      },
    },
  },

  mounted() {
    this.$nextTick(async () => {
      if (this.mostrarQR) {
        await this.obtenerQR();
      }
    });
  },

  created() {
    this.form.holder_name = this.payer.name;
    this.payment.currentStep = 2;
  },
  async updated() {
    if (this.mostrarQR && !this.fetchQR && this.reintentosQR <= 4) {
      await this.obtenerQR();
    }
  },

  methods: {
    ...mapActions(["pagarCheckout", "setLoading"]),
    async submitDebinForm() {
      if (this.$refs.debinForm.validate()) {
        this.form.card_brand = "QR";
        this.loadingPagar = true;

        // verificamos si se puede ralizar el pago
        const { status } = await checkoutService.verificarPago(this.form.uuid);

        if (!status) window.location.reload(); // si el pago ya se realizo recargar pagina

        // realizando pago
        if (status) {
          await this.pagarCheckout();
          this.loadingPagar = false;
        }
      }
    },

    async obtenerQR() {
      try {
        const params = {
          qrUrl: this.resultadoPago.url_qr,
        };

        const data = await checkoutService.obtenerQR(params);

        this.fetchQR = true;
        this.QR = data.data;

        // Calcular la fecha de fin sumando 10 minutos
        this.fechaFin = new Date(this.payment.fecha_expiracion);

        console.log(this.fechaFin);

        // Actualizar el temporizador cada segundo
        setInterval(this.actualizarTemporizador, 1000);
      } catch (error) {
        this.reintentosQR += 1;
        console.error(error);
      }
    },

    actualizarTemporizador() {
      if (this.fechaFin) {
        const ahora = new Date();
        const tiempoRestanteEnMilisegundos = this.fechaFin - ahora;

        // Verificar si ya alcanzamos la fecha de finalización
        if (tiempoRestanteEnMilisegundos <= 0) {
          this.tiempoRestante = "¡Tiempo terminado!";
          window.location.reload();
        } else {
          // Calcular minutos y segundos
          const minutos = Math.floor(
            tiempoRestanteEnMilisegundos / (1000 * 60)
          );
          const segundos = Math.floor(
            (tiempoRestanteEnMilisegundos % (1000 * 60)) / 1000
          );

          // Formatear la salida
          this.tiempoRestante = `${minutos}m ${segundos}s`;

          // para andrea la pelotuda
          // realizar peticion a los 4 minutos
          if (1000 * 60 * 4) {
            // llamar endpoint de emax
          }

          // para andrea la putis
          // realizar peticion a los 8 minutos
          if (1000 * 60 * 8) {
            // llamar endpoint de emax
          }
        }
      } else {
        this.tiempoRestante = "Esperando fecha de inicio...";
      }
    },
  },
};
</script>

<style scoped>
.col {
  padding: 0 !important;
}

.btn-container {
  display: flex;
  align-items: center;
  justify-content: end;
  margin-top: 30px;
}

.btn-submit {
  background: #c2d500 !important;
  font-weight: 800;
  text-transform: capitalize;
  font-size: 20px;
  line-height: 40px !important;
  margin-right: 100px;
}

.qr-container {
  position: relative;
  min-width: 150px;
  min-height: 150px;
  transition: transform 0.6s ease-out;
}

.qr-container:before,
.qr-container:after,
.qr-container > :first-child:before,
.qr-container > :first-child:after {
  position: absolute;
  width: 10%;
  height: 15%;
  border-color: #c2d500;
  /* border-color: #000; */
  border-style: solid;
  content: " ";
}

/* top left corner */
.qr-container:before {
  top: 0;
  left: 0;
  border-width: 2px 0 0 2px;
}

/* top right corner */
.qr-container:after {
  top: 0;
  right: 0;
  border-width: 2px 2px 0 0;
}

/* bottom right corner */
.qr-container > :first-child:before {
  bottom: 0;
  right: 0;
  border-width: 0 2px 2px 0;
}

/* bottom left corner */
.qr-container > :first-child:after {
  bottom: 0;
  left: 0;
  border-width: 0 0 2px 2px;
}

@media (max-width: 600px) {
  .btn-submit {
    margin: 50px auto 30px;
    position: relative;
    left: 0;

    width: 100%;
    font-size: 18px !important;
  }
}

@media (max-width: 420px) {
  .medio-pago__title {
    margin: 35px auto 25px;
  }
  .label-cuil {
    margin: 0 !important;
  }
  .btn-submit {
    margin: 50px auto 0px;
  }
}
</style>
