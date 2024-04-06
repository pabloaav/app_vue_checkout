<template>
  <div class="pago-exitoso-container">
    <v-row no-gutters>
      <v-col cols="12" class="d-flex align-center justify-center">
        <v-img
          src="@/assets/pago_exitoso.png"
          class="image"
          max-width="100px"
          max-height="100px"
          v-if="
            resultado.exito &&
            resultado.channel !== 'DEBIN' &&
            resultado.channel !== 'OFFLINE'
          "
        ></v-img>
        <v-img
          src="@/assets/pago_proceso.png"
          class="image"
          max-width="100px"
          max-height="100px"
          v-if="
            resultado.exito &&
            (resultado.channel === 'DEBIN' || resultado.channel === 'OFFLINE')
          "
        ></v-img>
        <v-img
          src="@/assets/pago_cancelado.png"
          class="image"
          max-width="100px"
          max-height="100px"
          v-if="!resultado.exito"
        ></v-img>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col
        cols="12"
        class="msj-container text-center white--text"
        :class="resultadoTitulo"
      >
        {{ mostrarResultadoTitulo(resultado) }}
      </v-col>

      <div class="mt-2" :class="resultadoDescripicon">
        <v-col cols="12" class="d-flex align-center justify-center">
          <div
            class="d-flex flex-column justify-center align-start ml-4 mt-2 text-subtitle-2"
            style="font-family: 'Montserrat' !important"
          >
            <p class="font-weight-bold mb-4 text-body-1">
              {{ mostrarResultadoDescripcion(resultado).titlePasos }}
            </p>
            <p class="mb-3">
              {{ mostrarResultadoDescripcion(resultado).firstMessage }}
            </p>
            <p
              class="mb-3"
              v-html="mostrarResultadoDescripcion(resultado).secondMessage"
            ></p>
            <p v-html="mostrarResultadoDescripcion(resultado).thirdMessage"></p>
          </div>
        </v-col>
      </div>
    </v-row>

    <v-row class="d-flex flex-column pago-detalle-container" no-gutters>
      <div cols="12">
        Estado:
        <span class="font-weight-bold">{{
          resultado.estado_pago.toLowerCase()
        }}</span>
      </div>

      <div cols="12">
        Concepto:
        <span class="font-weight-bold">{{ resultado.description }}</span>
      </div>

      <div cols="12">
        Monto:
        <span class="font-weight-bold">{{
          mostrarResultadoTotal(resultado)
        }}</span>
      </div>
    </v-row>

    <v-row>
      <v-col cols="12" class="buttons-container d-flex justify-space-around">
        <PlantillaImprimir
          :style="!resultado.exito ? 'visibility: hidden;' : ''"
          :resultado="resultado"
        />
        <v-btn
          rounded
          class="btn"
          color="secondary"
          @click="redirect(resultado)"
          >{{ resultado.exito ? "ACEPTAR" : "Volver a intentar" }}</v-btn
        >
      </v-col>
    </v-row>
  </div>
</template>

<script>
import PlantillaImprimir from "@/views/PlantillaImprimir.vue";
import { toPesos } from "@/helpers";
import { mapGetters } from "vuex";

export default {
  name: "resultadoPago",
  props: {
    resultado: Object,
  },
  data() {
    return {
      toPesos,
    };
  },
  computed: {
    ...mapGetters(["payment", "urls"]),
    resultadoTitulo: function () {
      return {
        error: !this.resultado.exito,

        amber:
          this.resultado.channel === "DEBIN" ||
          this.resultado.channel === "OFFLINE",
        success:
          this.resultado.exito &&
          this.resultado.channel !== "DEBIN" &&
          this.resultado.channel !== "OFFLINE",
      };
    },
    resultadoDescripicon: function () {
      return {
        "error--text": !this.resultado.exito,

        "grey--text text--darken-3": this.resultado.channel === "DEBIN",
        "amber--text": this.resultado.channel === "OFFLINE",

        "success--text":
          this.resultado.exito &&
          this.resultado.channel !== "DEBIN" &&
          this.resultado.channel !== "OFFLINE",
      };
    },
  },
  methods: {
    mostrarResultadoTitulo(resultado) {
      if (!resultado.exito) return "No se pudo procesar tu pago";

      if (resultado.channel === "OFFLINE" || resultado.channel === "DEBIN")
        return "Su pago está siendo procesado";

      return "Tu pago fue procesado exitosamente";
    },

    mostrarResultadoDescripcion(resultado) {
      if (!resultado.exito) return "Error : " + resultado.estado;

      if (resultado.channel === "DEBIN") {
        const titlePasos = "¡Para terminar debes aceptar el DEBIN!";
        const firstMessage =
          "1- Ingresá a tu home banking o a la aplicación móvil de tu banco.";
        const secondMessage =
          '2- Buscá la sección <b>"Pagos DEBIN"</b> e ingresá a la opción "Solicitudes de DEBIN Recibidas" (según el banco los nombres del menú varían).';
        const thirdMessage =
          '3- Aceptá el DEBIN generado, lo podés identificar como <b>"CORRIENTES TELECOMUNICACIONES"</b>.';

        return {
          titlePasos,
          firstMessage,
          secondMessage,
          thirdMessage,
        };
      }

      if (resultado.channel === "OFFLINE") {
        const titlePasos =
          "Para finalizar la operación diríjase a una sucursal de Rapipago o Multipagos con el recibo de pago.";
        return { titlePasos };
      }
      return { titlePasos: "" }; //caso por defecto (credito y debito)
    },

    mostrarResultadoTotal(resultado) {
      if (this.payment.total == resultado.importe_pagado)
        return toPesos(resultado.importe_pagado);

      return toPesos(resultado.importe_pagado, true);
    },

    redirect(resultado) {
      const { channel, exito } = resultado;

      // si el pago se realizo exitosamente
      if (exito) {
        channel === "OFFLINE" || channel === "DEBIN"
          ? (location.href = this.urls.back_url_pending) //redireccion pago exitoso rapipago y debin
          : (location.href = this.urls.back_url_success); // redireccion pago exitoso credito y debito
      } else {
        // en caso de algun error, recargar pagina
        window.location.reload();
      }
    },
  },
  components: { PlantillaImprimir },
};
</script>

<style scopeds>
.pago-exitoso-container {
  max-width: 790px;
  margin: auto;
}
.msj-container {
  font-size: 23px;
  font-weight: 700;

  padding: 8px 0 !important;
  margin-top: 25px;
  border-radius: 18px;
}

.pago-detalle-container {
  font-size: 20px;
  margin-top: 25px !important;
}

.btn {
  font-weight: 800;
  font-size: 19px !important;
}

.buttons-container {
  max-width: 840px;
  margin-top: 30px;
}

@media (max-width: 830px) {
  .pago-exitoso-container {
    margin: auto 20px;
  }
  .msj-container {
    padding: 16px 5px !important;
  }
  .buttons-container {
    position: relative;
    margin-top: 20px;
  }
}

@media (max-width: 600px) {
  .buttons-container {
    position: relative;
    flex-direction: column;
    margin: 30px auto 25px;
    gap: 10px;
  }

  .btn {
    width: 100%;
    font-size: 16px !important;
  }
}

@media (max-width: 420px) {
  .image {
    transform: scale(0.65);
  }

  .msj-container {
    font-size: 18px;
    border-radius: 10px;
    padding: 13px 5px !important;
    margin-top: 0px !important;
  }

  .pago-detalle-container {
    font-size: 18px;
    margin-top: 60px !important;
  }
}
</style>
