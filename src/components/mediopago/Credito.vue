<template>
  <div>
    <Card class="card" />
    <v-row>
      <v-col cols="12" class="medio-pago__title">
        <p class="text-center">PAGO CON TARJETA DE CRÉDITO</p>
      </v-col>
    </v-row>

    <!--FORMULARIO CONTAINER-->
    <v-form ref="creditForm" @submit.prevent="submitCreditForm">
      <v-row class="medio-pago__form" no-gutters>
        <!--NUMERO DE TARJETA-->
        <v-col cols="12" sm="5">
          <v-text-field
            v-model="form.card_number"
            type="number"
            min="0"
            label="Número de la tarjeta"
            solo
            outlined
            color="black"
            class="mr-2"
            dense
            :rules="rules.card_number"
            :counter="form.longitud_pan || 16"
            :autocomplete="false"
            ref="cardNumber"
            @blur="validarTarjeta(form.card_number)"
          ></v-text-field>
        </v-col>

        <!--CODIGO DE SEGURIDAD-->
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="form.card_code"
            label="Código de seguridad"
            :append-icon="showCode ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showCode ? 'number' : 'password'"
            @click:append="showCode = !showCode"
            solo
            outlined
            color="black"
            class="mr-2"
            @focus="flip()"
            @blur="flip()"
            dense
            :rules="rules.card_code"
            :counter="form.longitud_cvv || 3"
            :autocomplete="false"
          ></v-text-field>
        </v-col>

        <!--CUOTAS-->
        <v-col cols="12" sm="3">
          <v-select
            v-model="form.installments"
            :items="cuotas"
            item-text="label"
            item-value="cuota.cuota"
            label="Cuotas"
            no-data-text="Sin cuotas disponibles"
            solo
            outlined
            color="black"
            class="mr-2"
            dense
            :rules="rules.installments"
            @change="(cuota) => seleccionarCuota(cuota)"
          ></v-select>
        </v-col>

        <!--BOTON DE COSTOS-->
        <v-col cols="12" class="d-flex justify-end" style="margin-top: -10px">
          <v-btn
            small
            outlined
            color="secondary"
            rounded
            class="font-weight-bold mb-2"
            @click="setDialogCostos(true)"
            >ver costos
          </v-btn>
        </v-col>

        <!--MES DE VENCIMINTO-->
        <v-col cols="12" sm="3">
          <v-select
            v-model="form.card_month"
            label="Mes de vencimiento"
            :items="meses"
            solo
            outlined
            color="black"
            class="mr-2"
            dense
            :rules="rules.card_month"
          ></v-select>
        </v-col>

        <!--AÑO VENCIMIENTO-->
        <v-col cols="12" sm="3">
          <v-select
            v-model="form.card_year"
            label="Año de vencimiento"
            :items="anios"
            solo
            outlined
            color="black"
            class="mr-2"
            dense
            :rules="rules.card_year"
          ></v-select>
        </v-col>

        <!--TITULAR-->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="form.holder_name"
            label="Titular (como aparece en la tarjeta)"
            solo
            outlined
            color="black"
            dense
            :rules="rules.titular"
          ></v-text-field>
        </v-col>

        <!--DNI-->
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="form.holder_docNum"
            type="number"
            label="DNI"
            solo
            outlined
            color="black"
            class="mr-2"
            dense
            :rules="rules.dni"
          ></v-text-field>
        </v-col>

        <!--CORREO-->
        <v-col cols="12" sm="8">
          <v-text-field
            v-model="form.holder_email"
            label="Email"
            solo
            outlined
            color="black"
            :rules="rules.email"
            dense
          ></v-text-field>
        </v-col>
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

    <!--AVISO DE MEDIO DE PAGO CREDITO-->
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
              <span class="font-weight-bold">TARJETA DE CRÉDITO</span>
              <p>Verifique que su tarjeta sea CRÉDITO</p>
            </v-col>
            <v-col cols="12" sm="2" class="shrink">
              <v-btn
                color="lime darken-4"
                small
                rounded
                outlined
                class="font-weight-bold"
                @click="alerta = false"
                >Aceptar
              </v-btn>
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
import { toPesos } from "@/helpers";
import checkoutService from "@/services/checkout";

export default {
  name: "Credito",
  components: { Card },
  data() {
    return {
      loadingPagar: false,
      showCode: false,
      alerta: true,
      tarjetaPrepaga: false, // validacion si es tarjeta prepaga
      tarjetaDebito: false, // validacion si es tarjeta debito
      card_brand: "",
      valorCupon: "",

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

      cuotas: [],

      rules: {
        email: [
          (v) => !!v || "El correo es requerido",
          (v) => /.+@.+\..+/.test(v) || "Ingrese un correo válido",
        ],
        dni: [
          (v) => !!v || "El dni es requerido",
          (v) => /^\d+$/.test(v) || "Solo se permiten números",
          (v) => v.length < 13 || "El dni solo puede tener hasta 12 dígitos",
        ],
        titular: [
          (v) => !!v || "El nombre del titular es requerido",
          (v) => /^[A-Za-z\s]*$/.test(v) || "Solo se permiten letras",
        ],
        card_month: [(v) => !!v || "Campo requerido"],
        card_year: [(v) => !!v || "Campo requerido"],
        installments: [(v) => !!v || "Seleccione una cuota"],
        card_code: [
          (v) => !!v || "Campo requerido",
          (v) => /^\d+$/.test(v) || "Solo se permiten números",
          (v) =>
            v.length <= (this.form.longitud_cvv || 3) || "Demasiado números",
        ],
        card_number: [
          (v) => !!v || "El número de tarjeta es requerido",
          (v) => /^\d+$/.test(v) || "Solo se permiten números",
          () => this.card_brand.length !== 0 || "Tarjeta inválida",
          (v) => v.length <= this.form.longitud_pan || "Demasiado números",
          () => !this.tarjetaPrepaga || "No se permiten tarjetas prepagas",
          () => !this.tarjetaDebito || "Número de tarjeta no válido",
        ],
      },
    };
  },
  watch: {
    "form.card_brand"(newCardBrand) {
      this.card_brand = newCardBrand;

      const planActual = this.planCuotas.find(
        (plan) =>
          plan.mediopagoinstallments_id === this.form.installment_details_id
      );

      planActual.installmentdetail.forEach((cuota) => {
        cuota = { ...cuota, cuota: String(cuota.cuota) };
        const label = `${cuota.cuota} - ${toPesos(cuota.importe_total, true)}`;
        this.cuotas.push({ label, cuota });
      });

      this.seleccionarCuota("1");
    },
    "form.holder_name"(newHolderName) {
      this.form.holder_name = newHolderName.toUpperCase();
    },
    async "form.card_number"(newCardNumber) {
      const cardLength = newCardNumber.length;
      if (cardLength === 8 || cardLength === this.form.longitud_pan) {
        this.validarTarjeta(newCardNumber);
      }

      if (newCardNumber.length < 8) {
        this.tarjetaPrepaga = false;
        this.tarjetaDebito = false;
      }

      this.$refs.cardNumber.validate();
    },
  },
  computed: {
    ...mapGetters(["payment", "planCuotas"]),
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
    this.payment.currentStep = 2;
  },
  methods: {
    ...mapActions(["pagarCheckout", "setDialogCostos", "verificarBinTarjeta"]),
    flip() {
      const card = document.querySelectorAll(".card__inner");
      card.forEach((c) => c.classList.toggle("is-flipped"));
    },

    seleccionarCuota(cuota) {
      const cuotaSeleccionada = this.cuotas.filter(
        (c) => c.cuota.cuota === cuota
      );

      const importeTotal = cuotaSeleccionada[0].cuota.importe_total;

      // transformando el importe de la cuota de float a entero por ej 124.51 ==> 12451
      this.valorCupon = Number(
        String(importeTotal.toFixed(2)).split(".").join("")
      );
    },

    async submitCreditForm() {
      if (this.$refs.creditForm.validate()) {
        this.loadingPagar = true;
        this.form.valorcupon = this.valorCupon;

        // verificamos si se puede ralizar el pago
        const { status } = await checkoutService.verificarPago(this.form.uuid);

        if (!status) window.location.reload(); // si el pago ya se realizo recargar pagina

        //realizando pago
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
          TipoTarjeta: "C",
        };

        const { data } = await this.verificarBinTarjeta(params);

        // validamos si la tarjeta no es valida
        if (data && !data.tarjeta_valida) {
          // comprobamos si el bin ingresado pertenece a una tarjeta prepaga

          if (data.pre_pago) this.tarjetaPrepaga = true;

          // comprobamos si el bin ingresado pertenece a una tarjeta de debito
          if (data.type.includes("debit")) this.tarjetaDebito = true;

          if (data.type.length === 0) this.tarjetaDebito = true;
        }

        this.$refs.cardNumber.validate();
      } catch (error) {
        console.log("error al consultar bin: ", error);
        this.tarjetaDebito = true;
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
  bottom: 12px;
  right: 90px;

  background: #c2d500 !important;
  font-weight: 800;
  text-transform: capitalize;
  font-size: 18px;
  line-height: 38px !important;
}

.card {
  margin-top: -30px;
}

@media (max-width: 700px) {
  .medio-pago__form {
    margin-bottom: 30px !important;
  }

  .card {
    margin-top: 0;
  }
}

@media (max-width: 600px) {
  .btn-submit {
    margin: 20px auto 30px;
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
    margin-top: 0px !important;
    margin-bottom: 10px;
    font-size: 16px !important;
  }
}
</style>
