<template>
  <div>
    <v-row>
      <v-col cols="12" class="medio-pago__title">
        <p class="text-center mt-3 mb-1">PAGO CON EFECTIVO</p>
      </v-col>
    </v-row>

    <!--<div class="d-flex justify-center my-5">
      <v-btn-toggle
        v-model="tipoEfectivo"
        mandatory
        color="grey"
        :borderless="true"
        shaped
      >
        <v-btn class="px-4 px-md-7" value="rapipago">
          <v-img
            src="@/assets/rapipago_logo_bg.png"
            style="transform: scale(0.8)"
          ></v-img>
        </v-btn>

        <v-btn class="px-4 px-md-7" value="multipagos">
          <v-img src="@/assets/logo_multipago.png" max-width="120"></v-img>
        </v-btn>
      </v-btn-toggle>
    </div> -->

    <!--FORMULARIO CONTAINER-->
    <v-form ref="efectivoForm" @submit.prevent="submitEfectivoForm">
      <v-row class="medio-pago__form" no-gutters>
        <!--DNI-->
        <v-col cols="12" sm="4"
          ><v-select
            v-model="form.holder_docType"
            :items="doctype_items"
            solo
            outlined
            color="black"
            class="mr-2"
            dense
          ></v-select
        ></v-col>

        <!--NUMERO DE IDENTIFICACION-->
        <v-col cols="12" sm="8"
          ><v-text-field
            v-model="form.holder_docNum"
            label="Número de Identificación"
            type="number"
            solo
            outlined
            color="black"
            dense
            :rules="rules.identificacion"
          ></v-text-field
        ></v-col>

        <!--NOMBRE COMPLETO-->
        <v-col cols="12" sm="8"
          ><v-text-field
            v-model="form.holder_name"
            label="Nombre Completo"
            solo
            outlined
            color="black"
            dense
            :rules="rules.nombre"
          ></v-text-field
        ></v-col>

        <!--EMAIL-->
        <v-col cols="12"
          ><v-text-field
            v-model="form.holder_email"
            label="Email"
            solo
            outlined
            dense
            color="black"
            :rules="rules.email"
          ></v-text-field
        ></v-col>
      </v-row>
      <div class="btn-container">
        <v-btn
          class="btn-submit px-12 secondary"
          rounded
          type="submit"
          :loading="loadingPagar"
          >{{ loadingPagar ? "Procesando pago" : "Pagar" }}
          <template class="px-2" v-slot:loader>
            <span>Procesando pago</span>
            <span class="loader-btn mx-1"></span>
          </template>
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import checkoutService from "@/services/checkout";

export default {
  name: "Efectivo",
  data: () => ({
    loadingPagar: false,

    doctype_items: ["DNI", "CI", "LE", "LC"],
    rules: {
      email: [
        (v) => !!v || "El correo es requerido",
        (v) => /.+@.+\..+/.test(v) || "Ingrese un correo válido",
      ],
      nombre: [
        (v) => !!v || "El nombre es requerido",
        (v) =>
          (v && v.length <= 50) ||
          "El nombre debe tener menos de 50 caracteres",
      ],
      identificacion: [
        (v) => !!v || "Número de identificacion es requerido",
        (v) => /^\d+$/.test(v) || "Solo se permiten números",
      ],
    },

    tipoEfectivo: "rapipago",
  }),

  watch: {
    "form.holder_name"(newHolderName) {
      this.form.holder_name = newHolderName.toUpperCase();
    },
  },

  created() {
    this.form.holder_name = this.payer.name;
    this.payment.currentStep = 2;
  },
  computed: {
    ...mapGetters(["payment", "payer"]),
    form: {
      get() {
        return this.$store.getters["form"];
      },
      set(newForm) {
        this.$store.dispatch("setForm", newForm);
      },
    },
  },
  methods: {
    ...mapActions(["pagarCheckout"]),
    async submitEfectivoForm() {
      if (this.$refs.efectivoForm.validate()) {
        this.form.card_brand = this.tipoEfectivo;
        this.loadingPagar = true;

        if (this.tipoEfectivo == "multipagos") this.form.channel = "multipagos";

        // verificamos si se puede ralizar el pago
        // const { status } = await checkoutService.verificarPago(this.form.uuid);

        // if (!status) window.location.reload(); // si el pago ya se realizo recargar pagina

        //realizando pago
        if (true) {
          await this.pagarCheckout();
          this.loadingPagar = false;
        }
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

@media (max-width: 600px) {
  .btn-submit {
    margin: 50px auto 30px;

    width: 100%;
    font-size: 18px !important;
  }
}

@media (max-width: 420px) {
  .medio-pago__title {
    margin: 35px auto 25px;
  }
  .btn-submit {
    margin: 50px auto 10px;
  }
}
</style>
