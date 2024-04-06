<template>
  <div>
    <Card />

    <v-row>
      <v-col cols="12" class="medio-pago__title">
        <p class="text-center">PAGO CON TARJETA DE DÉBITO</p>
      </v-col>
    </v-row>

    <!--FORMULARIO CONTAINER-->
    <v-form ref="debitForm" @submit.prevent="submitDebitForm">
      <v-row class="medio-pago__form" no-gutters>
        <!--NUMERO DE TARJETA-->
        <v-col cols="12" sm="5">
          <v-text-field
            v-model="form.card_number"
            type="number"
            autocomplete="off"
            min="0"
            label="Número de la tarjeta"
            solo
            outlined
            color="black"
            class="mr-2"
            :rules="rules.card_number"
            dense
            :counter="this.form.longitud_pan || 16"
            @blur="validarTarjeta(form.card_number)"
            ref="cardNumber"
          ></v-text-field
        ></v-col>

        <!--MES DE VENCIMIENTOS-->
        <v-col cols="12" sm="4"
          ><v-select
            v-model="form.card_month"
            :items="meses"
            label="Mes de vencimiento"
            solo
            outlined
            color="black"
            class="mr-2"
            :rules="rules.card_month"
            dense
          ></v-select
        ></v-col>

        <!--AÑO DE VENCIMIENTO-->
        <v-col cols="12" sm="3">
          <v-select
            v-model="form.card_year"
            :items="anios"
            label="Año de vencimiento"
            solo
            dense
            color="black"
            :rules="rules.card_year"
            outlined
          >
          </v-select>
        </v-col>

        <!--TITULAR-->
        <v-col cols="12" sm="7"
          ><v-text-field
            v-model="form.holder_name"
            label="Titular (como aparece en la tarjeta)"
            solo
            outlined
            color="black"
            class="mr-2"
            dense
            :rules="rules.holder_name"
          ></v-text-field
        ></v-col>

        <!--CODIGO DE SEGURIDAD-->
        <v-col cols="12" sm="5"
          ><v-text-field
            v-model="form.card_code"
            label="Código de seguridad"
            :append-icon="showCode ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showCode ? 'number' : 'password'"
            @click:append="showCode = !showCode"
            solo
            outlined
            color="black"
            @focus="flip()"
            @blur="flip()"
            :rules="rules.card_code"
            :counter="form.longitud_cvv || 3"
            dense
          ></v-text-field
        ></v-col>

        <!--DNI-->
        <v-col cols="12" sm="4"
          ><v-text-field
            v-model="form.holder_docNum"
            type="number"
            label="DNI"
            solo
            outlined
            color="black"
            class="mr-2"
            dense
            :rules="rules.docNum"
          ></v-text-field
        ></v-col>

        <!--EMAIL-->
        <v-col cols="12" sm="8"
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
    </v-form>

    <v-dialog v-model="alerta" width="650px" persistent>
      <div class="white">
        <v-alert
          text
          color="lime darken-4"
          icon="mdi-information"
          border="left"
          width="100%"
          class="my-0"
        >
          <v-row align="center" class="py-4 px-2">
            <v-col cols="12" sm="10" class="grow">
              Usted seleccionó medio de pago
              <span class="font-weight-bold">TARJETA DE DÉBITO</span>
              <p>Verifique que su tarjeta sea DÉBITO</p>
            </v-col>
            <v-col cols="12" sm="2" class="shrink">
              <v-btn
                color="lime darken-4"
                small
                rounded
                outlined
                class="font-weight-bold"
                @click="alerta = false"
                >Aceptar</v-btn
              >
            </v-col>
          </v-row>
        </v-alert>
      </div>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Card from "../Card.vue";
import checkoutService from "@/services/checkout";

export default {
  name: "Debitos",
  components: {
    Card,
  },
  data() {
    return {
      alerta: true,
      loadingPagar: false,
      showCode: false,
      card_brand: "",

      meses: [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
      ],
      anios: [
        "2023",
        "2024",
        "2025",
        "2026",
        "2027",
        "2028",
        "2029",
        "2030",
        "2031",
        "2032",
        "2033",
        "2034",
        "2035",
      ],

      rules: {
        email: [
          (v) => !!v || "El correo es requerido",
          (v) => /.+@.+\..+/.test(v) || "Ingrese un correo válido",
        ],
        docNum: [
          (v) => !!v || "El dni es requerido",
          (v) => /^\d+$/.test(v) || "Solo se permiten números",
          (v) => v.length < 13 || "El dni solo puede tener hasta 12 dígitos",
        ],
        holder_name: [
          (v) => !!v || "El nombre del titular es requerido",
          (v) => /^[A-Za-z\s]*$/.test(v) || "Solo se permiten letras",
        ],
        card_month: [(v) => !!v || "Campo requerido"],
        card_year: [(v) => !!v || "Campo requerido"],
        card_code: [
          (v) => !!v || "Campo requerido",
          (v) => /^\d+$/.test(v) || "Solo se permiten números",
          (v) =>
            v.length <= (this.form.longitud_cvv || 3) || "Demasiado números",
        ],
        card_number: [
          (v) => !!v || "El número de tarjeta es requerido",
          (v) => /^\d+$/.test(v) || "Solo se permiten números",
          // () => this.card_brand.length !== 0 || "Tarjeta inválida",
          (v) => v.length <= this.form.longitud_pan || "Demasiado números",
          // () => !this.tarjetaPrepaga || "No se permiten tarjetas prepagas",
          // () => !this.tarjetaInvalida || "Número de tarjeta no válido",
        ],
      },

      tarjetaPrepaga: false,
      tarjetaInvalida: false,
    };
  },
  watch: {
    "form.holder_name"(newHolderName) {
      this.form.holder_name = newHolderName.toUpperCase();
    },
    "form.card_brand"(newCardBrand) {
      this.card_brand = newCardBrand;
    },

    async "form.card_number"(newCardNumber) {
      const cardLength = newCardNumber.length;
      if (cardLength === 8 || cardLength === this.form.longitud_pan) {
        this.validarTarjeta(newCardNumber);
      }

      if (newCardNumber.length < 8) {
        this.tarjetaPrepaga = false;
        this.tarjetaInvalida = false;
      }

      this.$refs.cardNumber.validate();
    },
  },
  created() {
    this.payment.currentStep = 2;
  },
  computed: {
    ...mapGetters(["payment"]),
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
    ...mapActions(["pagarCheckout", "verificarBinTarjeta"]),

    flip() {
      const card = document.querySelectorAll(".card__inner");
      card.forEach((c) => c.classList.toggle("is-flipped"));
    },
    async submitDebitForm() {
      if (this.$refs.debitForm.validate()) {
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

    async validarTarjeta(newCardNumber) {
      try {
        const params = {
          NroBin: newCardNumber.substring(0, 8),
          TipoTarjeta: "D",
        };
        const { data } = await this.verificarBinTarjeta(params);
        // validamos si la tarjeta no es valida
        if (data && !data.tarjeta_valida) {
          // comprobamos si el bin ingresado pertenece a una tarjeta prepaga
          if (data.pre_pago) this.tarjetaPrepaga = true;

          // comprobamos si el bin ingresado pertenece a una tarjeta de debito
          if (data.type.includes("credit")) this.tarjetaInvalida = true;

          if (data.type.length === 0) this.tarjetaInvalida = true;
        }

        this.$refs.cardNumber.validate();
      } catch (error) {
        console.log("error al consultar bin: ", error);
        this.tarjetaInvalida = true;
        this.$refs.cardNumber.validate();
      }
    },
  },
};
</script>

<style scoped>
.col {
  padding: 0;
}

.btn-submit {
  position: absolute;
  bottom: 22px;
  right: 127px;

  background: #c2d500 !important;
  font-weight: 800;
  text-transform: capitalize;
  font-size: 20px;
  line-height: 40px !important;
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
  .btn-submit {
    margin: 35px auto 0px;
  }
}
</style>
