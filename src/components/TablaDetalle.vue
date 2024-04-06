<template>
  <div class="costos-container" v-if="dialogDetalle">
    <v-card class="table-container overflow-y-auto">
      <v-card-title
        class="title primary--text ml-8 mt-4"
        style="font-weight: 500"
      >
        DETALLE DE PAGO
        <v-spacer></v-spacer>
        <v-btn icon class="primary--text mr-8" @click="setDialogDetalle(false)"
          ><v-icon>mdi-close</v-icon></v-btn
        >
      </v-card-title>

      <div class="mx-5 mb-4">
        <p class="mb-1">Referencia: {{ payment.external_reference }}</p>
        <p class="mb-1">Concepto: {{ product.description }}</p>
        <p class="mb-1">Nombre: {{ payer.name }}</p>
      </div>

      <v-data-table
        :headers="computedHeaders"
        :items="detalles"
        hide-default-footer
        disable-pagination
        mobile-breakpoint="420"
        disable-sort
        height="300px"
        no-data-text="Sin detalle disponible"
        class="px-4 overflow-y-auto"
      >
        <template v-slot:[`item.identifier`]="{ item }">
          {{ item.identifier ? item.identifier : "-" }}
        </template>
        <template v-slot:[`item.amount`]="{ item }">
          {{ toPesos(item.amount, true) }}
        </template>
      </v-data-table>

      <div class="d-flex justify-center mb-4">
        <v-btn
          class="mt-5 font-weight-bold"
          text
          @click="setDialogDetalle(false)"
          >Cerrar</v-btn
        >
      </div>
    </v-card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { toPesos } from "@/helpers";

export default {
  name: "TablaDetalle",
  data: () => ({
    toPesos,
    panelCostos: 0,

    headers: [
      { text: "IDENTIFICADOR", align: "center", value: "identifier" },
      { text: "CANTIDAD", align: "center", value: "quantity" },
      { text: "DESCRIPCIÓN", value: "description", width: "300px" },
      { text: "MONTO", value: "amount" },
    ],

    cuotas: [],
    detalles: [],
    dialog: true,
  }),

  watch: {
    panelCostos(panelSeleccionado) {
      this.panelCostos = panelSeleccionado || 0;
    },
  },
  mounted() {
    // se valida para que cuando se seleccione el medio de pago 'CREDIT'
    // no se vuelva a realizar la petición al endpoint
    if (!this.planCuotas) this.getPlanCuotas();

    this.detalles = JSON.parse(this.product.items);
  },

  computed: {
    ...mapGetters([
      "dialogDetalle",
      "planCuotas",
      "product",
      "payer",
      "payment",
    ]),
    computedHeaders() {
      // se encarga de ocultar la columna "identificador" en caso de que esté vacio
      return this.headers.filter((column) => {
        const items = JSON.parse(this.product.items);
        const hideColumn = items.every((item) => !item.identifier);

        if (column.value === "identifier" && hideColumn) {
          return false;
        }

        return column;
      });
    },
  },
  methods: {
    ...mapActions(["setDialogDetalle", "getPlanCuotas"]),
  },
};
</script>

<style scoped>
.costos-container {
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

.table-container {
  max-width: 720px;
  border-radius: 60px;
}

.title {
  font-size: 20px !important;
}

.v-expansion-panel::before {
  box-shadow: none !important;
}

.btn-close {
  position: absolute;
  top: 0;
  right: 0;
}

table .v-table tbody td {
  height: 40px;
  border: none;
}
.theme--light .v-table tbody tr:not(:last-child) {
  border-bottom: none;
}

@media (max-width: 700px) {
  .table-container {
    border-radius: 42px;
  }
}

@media (max-width: 420px) {
  .table-container {
    height: 100vh;
    border-radius: 20px;
    overflow: auto;
  }

  .title {
    font-size: 16px !important;
  }
}
</style>
