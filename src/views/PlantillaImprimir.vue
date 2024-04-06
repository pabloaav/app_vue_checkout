<template>
  <div>
    <v-btn
      rounded
      color="primary"
      class="btn"
      @click="getPDF(resultado.pdf_url)"
      >IMPRIMIR RECIBO</v-btn
    >
    <vue-html2pdf
      :show-layout="false"
      :float-layout="true"
      :enable-download="true"
      :preview-modal="true"
      :paginate-elements-by-height="1100"
      :filename="`ReciboWee-${resultado.uuid}`"
      :pdf-quality="8"
      :manual-pagination="false"
      pdf-format="a4"
      :pdf-margin="10"
      pdf-orientation="portrait"
      pdf-content-width="800px"
      @progress="onProgress($event)"
      ref="html2Pdf"
    >
      <section slot="pdf-content" class="pdf-content">
        <img src="@/assets/cabecera_recibo.png" alt="" class="plantilla-img" />

        <div style="display: flex; justify-content: end">
          <div class="pdf__client">
            {{ resultado.cliente_name.toUpperCase() }} - CUIT
            {{ resultado.cliente_cuit }}
          </div>
        </div>

        <p style="font-size: 12px; text-align: center; font-weight: 600">
          Verás este pago en tu resumen como TelCo Wee!
        </p>
        <div style="padding: 0 40px">
          <p class="pdf__ref">
            Referencia de pago: {{ resultado.external_reference }}
          </p>

          <!--TABLA-->
          <div>
            <table>
              <tr class="table__header">
                <th>Transacción</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
              </tr>
              <tr
                class="table__item"
                v-for="(item, i) in JSON.parse(resultado.items)"
                :key="i"
              >
                <td>{{ item.identifier ? item.identifier : "-" }}</td>
                <td>{{ item.description }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ toPesos(item.amount, true) }}</td>
              </tr>
            </table>
          </div>

          <div class="pdf__total">
            <p
              :style="
                resultado.channel !== 'OFFLINE' ? 'visibility:hidden' : ''
              "
            >
              Primer Vto.:
              <span style="margin-left: 20px">
                {{ resultado.first_due_date }}
              </span>
            </p>
            <!--<p>Costo Financiero:</p> -->

            <div>
              <p>Total:</p>
              <!--<p style="font-weight: 800">2.61</p> -->
              <p>
                {{ toPesos(resultado.importe_pagado, true) }}
              </p>
            </div>
          </div>
          <div
            v-if="
              resultado.channel === 'OFFLINE' ||
              resultado.channel === 'MULTIPAGOS'
            "
          >
            <div class="pdf__total">
              <p>
                Segundo Vto.:
                <span style="margin-left: 20px">
                  {{ resultado.second_due_date }}
                </span>
              </p>

              <div>
                <p>Total:</p>

                <p>
                  {{ toPesos(resultado.second_total, true) }}
                </p>
              </div>
            </div>
            <canvas id="barcode"></canvas>
          </div>

          <div class="pdf__information">
            <p
              style="padding-bottom: 30px"
              v-if="
                resultado.channel === 'OFFLINE' ||
                resultado.channel === 'MULTIPAGOS'
              "
            >
              <b style="margin-right: 30%">Código Multipagos:</b>
              <b>{{ resultado.codigo_multipagos }}</b>
            </p>

            <p>
              Medio de Pago:
              <span>{{ resultado.mediopago }}</span>
            </p>
            <p>
              Nro Solicitud: <span>{{ resultado.id }}</span>
            </p>
            <p>
              Nro Op.: <span>{{ resultado.numero_operacion }}</span>
            </p>
            <p>
              Código Autorización: <span> {{ resultado.uuid }} </span>
            </p>
          </div>
        </div>

        <!-- <p class="footer">wee.ar</p> -->
        <img
          src="@/assets/footer_recibo.png"
          alt=""
          class="plantilla-img footer-img"
        />
      </section>
    </vue-html2pdf>
  </div>
</template>

<script>
import VueHtml2pdf from "vue-html2pdf";
import jsbarcode from "jsbarcode";
import { toPesos } from "@/helpers";

export default {
  name: "PlantillaImprimir",
  props: {
    resultado: Object,
  },
  data: () => ({
    toPesos,
  }),
  methods: {
    onProgress(event) {
      console.log(`Processed: ${event} / 100`);
    },
    hasGenerated() {
      alert("PDF generated successfully!");
    },
    generatePDF(barcode) {
      if (barcode.length > 0) jsbarcode("#barcode", barcode);

      this.$refs.html2Pdf.generatePdf();
    },
    getPDF(url) {
      window.open(url, "_blank");
    },
  },

  mounted() {
    if (resultado.channel === "OFFLINE" || resultado.channel === "MULTIPAGOS")
      jsbarcode("#barcode", this.resultado.barcode);
  },
  components: {
    VueHtml2pdf,
  },
};
</script>

<style scoped>
.pdf-content {
  font-family: "Montserrat", sans-serif;
  background: #fff;

  margin: auto;

  position: relative;

  min-height: 1120px;
}

.plantilla-img {
  max-width: 100%;
}

.pdf__client {
  background: #c2d82e;
  position: relative;
  font-size: 11px;
  padding: 8px 0;
  font-weight: 700;
  text-align: end;
  padding-right: 25px;
  padding-left: 60px;

  margin: 12px 0 16px;

  right: 0;
}

.pdf__ref {
  padding: 15px 0 10px;
  font-weight: 800;
  font-size: 13px;
}

table {
  width: 100%;
  margin-top: 14px;
  border-collapse: collapse;
}

.table__header {
  line-height: 28px;
  background: #00b1eb;

  font-size: 14px;
  font-weight: 800;
  color: #fff;
}

.table__item {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  line-height: 35px;

  border-bottom: 2px solid #00b1eb90;
}

.pdf__information {
  font-size: 12px;
  font-weight: 700;
}

.pdf__total {
  font-size: 12px;
  font-weight: 800;
  margin: 20px 0;

  display: flex;
}

#barcode {
  width: 380px;
}

.pdf__total > div {
  width: 215px;
  display: flex;

  gap: 80px;
  margin-left: auto;
  margin-right: 0;
}

.footer-img {
  position: absolute;
  max-width: 800px !important;

  bottom: 0 !important;
}
</style>
