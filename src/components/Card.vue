<template>
  <v-row>
    <v-col>
      <div class="card">
        <div class="card__inner">
          <v-sheet
            class="mx-auto pa-5 rounded-lg card__face card__face--front"
            :color="colorTarjeta()"
            elevation="5"
            max-width="400"
            min-height="120"
          >
            <v-row>
              <v-col cols="3">
                <v-img
                  src="@/assets/chip.png"
                  class="image pa-3 mx-auto"
                  height="50"
                  contain
                ></v-img>
              </v-col>
              <v-col cols="9">
                <div class="card-type float-right">
                  <v-scroll-x-transition>
                    <v-img
                      v-if="tipoTarjeta"
                      :src="require(`@/assets/${tipoTarjeta}.png`)"
                      height="50"
                      width="65"
                      contain
                      class="image"
                    ></v-img>
                  </v-scroll-x-transition>
                </div>
              </v-col>
            </v-row>

            <!--NUMERO DE TARJETA-->

            <div class="card-number text-center">
              <div v-if="card_number !== ''">
                <v-scroll-y-transition class="py-0" group tag="span">
                  <span
                    class="grey--text text--darken-2"
                    v-for="(n, key) in card_number"
                    :key="key + 1"
                    >{{ n }}</span
                  >
                </v-scroll-y-transition>
              </div>
              <span class="grey--text text--darken-2" v-else>
                #### #### #### ####
              </span>
            </div>

            <!--NOMBRE DE TARJETA-->
            <div class="card-name text-center">
              <div v-if="form.holder_name !== ''">
                <v-scroll-x-transition class="py-0" group tag="span">
                  <span
                    class="grey--text text--darken-2 text-uppercase"
                    v-for="(h, key) in form.holder_name"
                    :key="key + 1"
                    >{{ h }}</span
                  >
                </v-scroll-x-transition>
              </div>
              <span class="grey--text text--darken-2" v-else>
                NOMBRE DEL TITULAR
              </span>
            </div>

            <!--MES DE VENCIMIENTO-->
            <v-row no-gutters class="my-5">
              <v-col float-left>
                <v-row no-gutters>
                  <div v-if="form.card_month !== ''">
                    <v-scroll-y-transition>
                      <span class="grey--text text--darken-2">{{
                        form.card_month
                      }}</span>
                    </v-scroll-y-transition>
                  </div>
                  <span class="subtitle grey--text text--darken-2" v-else
                    >MM</span
                  >
                  <span class="subtitle grey--text text--darken-2"
                    >&nbsp; / &nbsp;</span
                  >

                  <div v-if="form.card_year !== ''">
                    <v-scroll-y-transition>
                      <span class="subtitle grey--text text--darken-2">{{
                        form.card_year.substring(2, 4)
                      }}</span>
                    </v-scroll-y-transition>
                  </div>
                  <span class="subtitle grey--text text--darken-2" v-else
                    >AA</span
                  >
                </v-row>
              </v-col>
            </v-row>
          </v-sheet>
          <v-sheet
            class="mx-auto rounded-lg card__face card__face--back"
            color="blue lighten-5"
            elevation="5"
            max-width="400"
            min-height="120"
          >
            <v-col px-0>
              <div class="band__space"></div>
              <div class="grey darken-4 magnetic__band" px-0></div>
              <div class="band__space"></div>
              <v-row justify="center">
                <v-card color="white" min-height="40"></v-card>
              </v-row>
              <v-row>
                <div class="card__code text-right">
                  <v-scroll-y-transition class="py-0" group tag="span">
                    <span
                      class="grey--text text--darken-2 text-right"
                      v-for="(h, key) in form.card_code"
                      :key="key + 1"
                    >
                      *
                    </span>
                  </v-scroll-y-transition>
                </div>
              </v-row>
            </v-col>
          </v-sheet>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from "vuex";
import apiPasarelaBin from "@/api/pasarela_bin";

export default {
  name: "Card",
  data: () => ({ card_number: "", tipoTarjeta: "" }),
  computed: {
    ...mapGetters(["form", "tarjetas"]),
  },
  watch: {
    "form.card_number"(newCardDisplay) {
      var reg = new RegExp(".{4}", "g");

      //separando el numero de tarjeta cada 4 dígitos
      this.card_number = newCardDisplay.replace(
        reg,
        (cuatroDigitos) => cuatroDigitos + " "
      );

      this.detectarTipoTarjeta(newCardDisplay);
    },
  },

  methods: {
    detectarTipoTarjeta(tarjetaIngresada) {
      this.tipoTarjeta = "";
      const number = tarjetaIngresada.substr(0, 6); // obteniendo los primeros 6 digitosde la tarjeta

      this.tarjetas.forEach((tarjeta) => {
        if (number.match(new RegExp(tarjeta.regexp))) {
          this.tipoTarjeta = tarjeta.mediopago;
          this.form.card_brand = tarjeta.mediopago;
          this.form.longitud_cvv = tarjeta.longitud_cvv;
          this.form.longitud_pan = tarjeta.longitud_pan;
        }
      });
    },

    colorTarjeta() {
      let color = "light-blue lighten-5";
      switch (this.tipoTarjeta) {
        case "VISA":
          color = "indigo lighten-3";
          break;
        case "VISA DÉBITO":
          color = "indigo lighten-3";
          break;
        case "MASTERCARD Prisma":
          color = "light-blue lighten-3";
          break;
        case "MASTERCARD DEBIT PRISMA":
          color = "light-blue lighten-3";
          break;
        case "DINERS CLUB":
          color = "blue-grey lighten-3";
          break;
        case "TARJETA NARANJA":
          color = "orange lighten-3";
          break;
        case "AMERICAN EXPRESS":
          color = "teal lighten-3";
          break;
        case "CABAL PRISMA":
          color = "deep-purple lighten-3";
          break;
        case "TARJETA NEVADA":
          color = "red lighten-3";
          break;
        case "NATIVA":
          color = "deep-purple lighten-3";
          break;
        case "TARJETA CLUB DÍA":
          color = "red lighten-3";
          break;

        default:
          color = "blue lighten-5";
          break;
      }
      return color;
    },
  },
};
</script>

<style scoped>
span {
  font-size: 22px;
  font-weight: 600;
}

.subtitle {
  font-size: 16px;
}
.card {
  margin: 5px auto 0;
  max-width: 360px;
  height: 195px;
  perspective: 1000px;
}

.card__inner {
  width: 100%;
  height: 100%;
  transition: transform 1s;
  transform-style: preserve-3d;
  cursor: pointer;
  position: relative;
}

.card__inner.is-flipped {
  transform: rotateY(180deg);
}

.card__face {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  overflow: hidden;
  background-image: linear-gradient(
    to bottom right,
    rgba(0, 0, 0, 0) 0%,
    rgb(256, 256, 256) 60%,
    rgba(0, 0, 0, 0) 100%
  );
}

.card__face--back {
  width: 100%;
  height: 100%;
  transform: rotateY(180deg);
  padding: 0;
}

.band__space {
  min-height: 30px;
}

.magnetic__band {
  width: 100%;
  height: 40px;
  margin-top: 5px;
}

.card__code {
  width: 100%;
  height: 40px;
  margin-top: 10px;
  padding: 0px 40px;
}

.image {
  transform: scale(0.85);
}

@media (max-width: 420px) {
  span {
    font-size: 17px;
  }

  .subtitle {
    font-size: 13px;
  }
}
</style>
