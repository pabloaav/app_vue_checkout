<template>
  <v-container class="white">
    <div v-if="!loading">
      <div v-if="payment.status">
        <CabeceraPago />

        <MediosPago v-if="payment.currentStep === 1 && !loading" />
        <Credito v-if="form.channel === 'credit'" />
        <Debito v-if="form.channel === 'debit'" />
        <Efectivo
          v-if="form.channel === 'offline' || form.channel === 'multipagos'"
        />
        <Debin v-if="form.channel === 'debin'" />
        <QR v-if="form.channel === 'qr'" />

        <ResultadoPago
          v-if="payment.currentStep === 3 && resultadoPago"
          :resultado="resultadoPago"
        />
      </div>
      <PagoRealizado v-else />
    </div>

    <!--ANIMACION PAGO EXITOSO O FALLIDO-->
    <div
      v-if="mostrarAnimacion"
      class="animacion-pago"
      :class="!resultadoPago.exito ? 'error' : 'success'"
    ></div>

    <!--ANIMACION LOADING HOME-->
    <div v-if="loading" class="animacion-loading-container">
      <span class="loader"></span>
    </div>

    <!--<TablaCostos/>-->
    <TablaCostos v-if="!loading" />
  </v-container>
</template>

<script>
import CabeceraPago from "@/components/CabeceraPago.vue";
import MediosPago from "@/components/MediosPago.vue";
import Efectivo from "@/components/mediopago/Efectivo.vue";
import Debin from "@/components/mediopago/Debin.vue";
import Credito from "@/components/mediopago/Credito.vue";
import Debito from "@/components/mediopago/Debito.vue";
import ResultadoPago from "@/components/ResultadoPago.vue";
import TablaCostos from "@/components/TablaCostos.vue";
import { mapGetters } from "vuex";
import PagoRealizado from "@/components/PagoRealizado.vue";
import QR from "@/components/mediopago/QR.vue";

export default {
  name: "Home",
  components: {
    CabeceraPago,
    MediosPago,
    Efectivo,
    Debin,
    Credito,
    Debito,
    ResultadoPago,
    TablaCostos,
    PagoRealizado,
    QR,
  },

  computed: {
    ...mapGetters([
      "form",
      "resultadoPago",
      "mostrarPago",
      "loading",
      "payment",
      "preferences",
      "mostrarAnimacion",
    ]),
  },
};
</script>

<style scoped>
.container {
  position: relative;
  margin: 15px auto 3px;
  max-width: 845px;
  min-height: 790px;
  border-radius: 70px;

  font-family: "Montserrat", sans-serif;
  overflow: hidden;

  transform: scale(0.95);
  margin-top: -10px;
}

.animacion-pago {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;

  animation: animacion 3s;
}

@keyframes animacion {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(570);
  }
}

/*RESPONSIVE  */
@media (max-width: 700px) {
  .container {
    border-radius: 40px;
  }
}

@media (max-width: 420px) {
  .container {
    border-radius: 30px;
    min-height: 100vh;
  }
}
</style>
