<template>
  <div>
    <v-row>
      <v-col cols="12" class="medio-pago__title">
        <p class="text-center mt-3">PAGO CON DEBIN</p>
      </v-col>
    </v-row>

    <!--FORMULARIO CONTAINER-->
    <v-form ref="debinForm" @submit.prevent="submitDebinForm">
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

        <!--CHECKBOX CBU ALIAS-->
        <v-col cols="12" class="d-flex">
          <v-checkbox
            label="CBU"
            v-model="cbu"
            class="mr-4 mb-2"
            color="success"
            hide-details
            dense
          ></v-checkbox>
          <v-checkbox
            label="Alias"
            v-model="alias"
            color="success"
            hide-details
            dense
            class="mb-2"
          ></v-checkbox>
        </v-col>

        <!--CBU ALIAS-->
        <v-col cols="12"
          ><v-text-field
            v-if="cbu"
            label="CBU"
            v-model="form.cbu"
            type="number"
            solo
            outlined
            color="black"
            :counter="22"
            :rules="rules.cbu"
            dense
          ></v-text-field>

          <v-text-field
            v-if="alias"
            label="Alias"
            v-model="form.alias"
            solo
            outlined
            color="black"
            :rules="rules.alias"
            dense
          ></v-text-field>
        </v-col>

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
  name: "Debin",
  data: () => ({
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
      cbu: [
        (v) => !!v || "Campo requerido",
        (v) => v.length === 22 || "El cbu debe tener 22 dígitos",
      ],
      alias: [(v) => !!v || "Campo requerido"],
      identificacion: [
        (v) => !!v || "Número de identificacion es requerido",
        (v) => /^\d+$/.test(v) || "Solo se permiten números",
        (v) => v.length === 11 || "El cuit debe contener 11 dígitos",
      ],
    },
  }),

  watch: {
    cbu(isActive) {
      if (isActive) this.alias = false;
      if (!isActive) this.alias = true;
    },
    alias(isActive) {
      if (isActive) this.cbu = false;
      if (!isActive) this.cbu = true;
    },
    "form.holder_name"(newHolderName) {
      this.form.holder_name = newHolderName.toUpperCase();
    },
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

  created() {
    this.form.holder_name = this.payer.name;
    this.payment.currentStep = 2;
  },

  methods: {
    ...mapActions(["pagarCheckout"]),
    async submitDebinForm() {
      if (this.$refs.debinForm.validate()) {
        this.form.card_brand = "debin";
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
