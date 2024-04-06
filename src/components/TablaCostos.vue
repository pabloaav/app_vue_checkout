<template>
  <div class="costos-container" v-if="dialogCostos">
    <v-card class="table-container">
      <v-card-title
        class="title primary--text ml-8 mt-4"
        style="font-weight: 500"
      >
        COSTO POR PAGO EN CUOTAS
        <v-spacer></v-spacer>
        <v-btn icon class="primary--text mr-8" @click="setDialogCostos(false)"
          ><v-icon>mdi-close</v-icon></v-btn
        >
      </v-card-title>
      <v-expansion-panels accordion v-model="panelCostos" class="px-2">
        <v-expansion-panel
          v-for="(plan, i) in planCuotas"
          :key="i"
          class="elevation-0"
        >
          <v-expansion-panel-header class="font-weight-bold">
            {{ plan.descripcion === "TELCO" ? "GENERAL" : plan.descripcion }}
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <!--
            <v-simple-table>
              <thead>
                <tr>
                  <th
                    class="text-center black--text font-weight-medium"
                    style="font-size: 16px"
                  >
                    Número de cuotas
                  </th>
                  <th
                    class="text-center black--text font-weight-medium"
                    style="font-size: 16px"
                  >
                    Porcentaje
                  </th>
                  <th
                    class="text-center black--text font-weight-medium"
                    style="font-size: 16px"
                  >
                    Importe Cuota
                  </th>
                  <th
                    class="text-center black--text font-weight-medium"
                    style="font-size: 16px"
                  >
                    Importe Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cuota in plan.installmentdetail">
                  <td class="text-center" style="font-size: 16px">
                    {{ cuota.cuota }}
                  </td>
                  <td class="text-center" style="font-size: 16px">
                    {{ cuota.tem }}%
                  </td>
                  <td class="text-center" style="font-size: 16px">
                    {{ toPesos(cuota.importe_cuota, true) }}
                  </td>
                  <td class="text-center" style="font-size: 16px">
                    {{ toPesos(cuota.importe_total, true) }}
                  </td>
                </tr>
              </tbody>
            </v-simple-table> -->

            <v-data-table
              :headers="headers"
              :items="plan.installmentdetail"
              hide-default-footer
              mobile-breakpoint="420"
              disable-sort
              no-data-text="Sin cuotas disponibles"
            >
              <template v-slot:[`item.tem`]="{ item }">
                {{ item.tem }} %
              </template>
              <template v-slot:[`item.importe_cuota`]="{ item }">
                {{ toPesos(item.importe_cuota, true) }}
              </template>
              <template v-slot:[`item.importe_total`]="{ item }">
                {{ toPesos(item.importe_total, true) }}
              </template>
            </v-data-table>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <div class="d-flex justify-center mb-4">
        <v-btn
          class="mt-5 font-weight-bold"
          text
          @click="setDialogCostos(false)"
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
  name: "TablaCostos",
  data: () => ({
    toPesos,
    panelCostos: 0,

    headers: [
      { text: "Número de cuotas", align: "center", value: "cuota" },
      { text: "Porcentaje", align: "center", value: "tem" },
      { text: "Importe por cuota", value: "importe_cuota", align: "center" },
      { text: "Importe total", value: "importe_total", align: "center" },
    ],

    cuotas: [],
    dialog: true,
  }),

  watch: {
    panelCostos(panelSeleccionado) {
      this.panelCostos = panelSeleccionado || 0;
    },
  },
  created() {
    // se valida para que cuando se seleccione el medio de pago 'CREDIT'
    // no se vuelva a realizar la petición al endpoint
    if (!this.planCuotas) this.getPlanCuotas();
  },

  computed: {
    ...mapGetters(["dialogCostos", "planCuotas", "payment"]),
  },
  methods: {
    ...mapActions(["setDialogCostos", "getPlanCuotas"]),
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
}

.table-container {
  max-width: 720px;
  border-radius: 82px;
}

.title {
  font-size: 25px !important;
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
