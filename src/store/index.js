import Vue from "vue";
import Vuex from "vuex";
import checkoutService from "@/services/checkout";
import apiPasarelaBin from "@/api/pasarela_bin";
import { Notyf } from "notyf";
import "notyf/notyf.min.css"; // for React, Vue and Svelte

const notyf = new Notyf({
  duration: 7000,
  position: { x: "center", y: "top" },
});

Vue.use(Vuex);

export default new Vuex.Store({
  namespaced: true,
  state: {
    //datos del pago checkout
    payer: null,
    cliente: null,
    product: null,
    planCuotas: null,
    payment: null,
    tarjetas: null,

    form: {
      channel: "",
      holder_name: "",
      holder_email: "",
      holder_docType: "DNI",
      holder_docNum: "",
      holder_cuit: "",
      card_brand: "",
      card_number: "",
      card_expiration: "",
      card_month: "",
      card_year: "",
      card_code: "",
      cbu: "",
      alias: "",
      installments: "1",
      installment_details_id: 1,
      uuid: "",
      id: "",
      es_cuenta_propia: false,
      concepto_abreviado: "VAR",
      tiempo_expiracion: 0,
      importe: 0,
      moneda: "ARS",
      recurrente: false,
      descripcion_prestacion: "",
    },

    prisma: null,
    resultadoPago: null,
    urls: [],
    preferences: null,

    dialogCostos: false,
    dialogDetalle: false,

    loading: false,

    mostrarQR: false,
    mostrarAnimacion: false,
  },
  getters: {
    importePagar: (state) => state.importePagar,
    tarjetas: (state) => state.tarjetas,
    payment: (state) => state.payment,
    cliente: (state) => state.cliente,
    planCuotas: (state) => state.planCuotas,
    product: (state) => state.product,
    prisma: (state) => state.prisma,
    resultadoPago: (state) => state.resultadoPago,
    payer: (state) => state.payer,
    preferences: (state) => state.preferences,

    dialogCostos: (state) => state.dialogCostos,
    dialogDetalle: (state) => state.dialogDetalle,

    form: (state) => state.form,

    loading: (state) => state.loading,
    urls: (state) => state.urls,

    mostrarQR: (state) => state.mostrarQR,
    mostrarAnimacion: (state) => state.mostrarAnimacion,
  },
  mutations: {
    setPrisma(state, prisma) {
      state.prisma = prisma;
    },
    setMedioPago(state, idMedioPago) {
      state.idMedioPago = idMedioPago;
    },
    setDialogCostos(state, dialogCostos) {
      state.dialogCostos = dialogCostos;
    },
    setDialogDetalle(state, dialogDetalle) {
      state.dialogDetalle = dialogDetalle;
    },
    setTarjetas(state, tarjetas) {
      state.tarjetas = tarjetas;
    },
    setPlanCuotas(state, planCuotas) {
      state.planCuotas = planCuotas;
    },

    setForm(state, form) {
      state.form = form;
    },

    setResultadoPago(state, resultado) {
      state.resultadoPago = resultado;
    },

    resetPago(state) {
      state.dialogCostos = false;
      const { uuid } = state.form;

      state.form = {
        channel: "",
        holder_name: "",
        holder_email: state.payer.email,
        holder_docType: "DNI",
        holder_docNum: "",
        holder_cuit: "",
        card_brand: "",
        card_number: "",
        card_expiration: "",
        card_month: "",
        card_year: "",
        card_code: "",
        cbu: "",
        alias: "",
        installments: "1",
        installment_details_id: 1,
        uuid: "",
        id: "",
        es_cuenta_propia: false,
        concepto_abreviado: "VAR",
        tiempo_expiracion: 0,
        importe: 0,
        moneda: "ARS",
        recurrente: false,
        descripcion_prestacion: "",
        uuid,
      };

      state.payment.currentStep = 1;
    },

    setLoading(state, loading) {
      state.loading = loading;
    },
  },
  actions: {
    /**
     * ! Metodo: checkPrisma
     *  * Se encarga de verificar si el servicio prisma funciona correctamente
     */
    async checkPrisma({ commit }) {
      this.state.loading = true;
      const prismaData = await checkoutService.checkPrisma();

      // comprobamos si no está disponible el servicio de prisma
      if (!prismaData.status)
        return this.$toast.error("Servicio prisma no disponible");

      commit("setPrisma", prismaData);
    },

    /**
     * ! Metodo: getCheckoutData
     * * primera funcion en ejecutarse, obtiene todos los datos necesarios para comenzar con el proceso de pago
     * @param uuid es un string con el que se identifica el checkout a pagar
     */
    async getCheckoutData({ commit }, uuid) {
      //obteniendo los datos del checkout
      const checkoutData = await checkoutService.checkout(uuid);

      if (!checkoutData.status) {
        this.state.loading = false;
        return (this.state.payment = checkoutData);
      }

      //si hay una respuesta exitosa
      //almacenamos el nombre del cliente
      this.state.cliente = checkoutData.data.cliente;

      //almacenando datos del pagador
      const payer = {
        name: checkoutData.data.payer_name,
        email: checkoutData.data.payer_email,
      };
      this.state.payer = payer;
      this.state.form.holder_email = payer.email;

      //almacenando datos del producto a pagar
      const product = {
        description: checkoutData.data.description,
        items: checkoutData.data.items,
      };
      this.state.product = product;

      //almacenando datos del pago
      const payment = {
        state: checkoutData.data.estado,
        external_reference: checkoutData.data.external_reference,
        created_at: checkoutData.data.created_at,
        due_date: checkoutData.data.due_date,
        second_due_date: checkoutData.data.second_due_date,
        fecha_expiracion: checkoutData.data.fecha_hora_expiracion,

        included_channels: checkoutData.data.included_channels,
        included_installments: checkoutData.data.included_installments,

        //importe a pagar
        total: checkoutData.data.total,

        currentStep: 1,
        status: true,
      };

      if (payment.state === "PENDIENTE") delete payment.fecha_expiracion;

      this.state.payment = payment;
      this.state.form.importe = payment.first_total;
      this.state.form.uuid = uuid;

      //almacenando url redireccion para post pagar
      const urls = {
        back_url_success: checkoutData.data.back_url_success,
        back_url_pending: checkoutData.data.back_url_pending,
      };
      this.state.urls = urls;

      if (checkoutData.data.url_qr) {
        this.state.form.channel = "qr";
        this.state.resultadoPago = { url_qr: checkoutData.data.url_qr };
        this.state.mostrarQR = true;
        // this.state.payment.currentStep = 2;
      }

      //alamacenando preferencias para customizacion
      // descomentar cuando ya está lo de preferencias
      /* if (checkoutData.data.preferences?.mainColor) {
        const preferences = {
          main_color: checkoutData.data.preferences.mainColor,
          secondary_color: checkoutData.data.preferences.secondaryColor,
          logo: checkoutData.data.preferences.logo,
        };

        this.state.preferences = preferences;
      } */

      this.state.loading = false;
    },

    /**
     * !  Metodo: getTarjetas
     * * recibe los datos de todas las tarjetas y posteriormente los filtra
     * * teniendo en cuenta si el channel coincide con el tipo recibo por parametro
     *  @param type es un string que puede ser CREDIT o DEBIT
     */
    async getTarjetas({ commit }, type) {
      this.state.loading = true;
      const tarjetasData = await checkoutService.obtenerTarjetas();

      this.state.loading = false;
      const tarjetas = tarjetasData.data.filter(
        (tarjeta) => tarjeta.channel.channel === type
      );

      commit("setTarjetas", tarjetas); // * Se guardan las tarjetas en el store
    },

    /**
     * ! Metodo: getPlanCuotas
     *  * recibe los planes de cuotas disponibles con todas las cuotas y posteriormente
     *  * se filtra teniendo en cuenta las cuotas posibles almacenado en el objeto payment
     */
    async getPlanCuotas({ commit }) {
      if (this.state.payment.state) {
        // obtenemos el importe a pagar y las cuotas posibles del objeto payment
        const { included_installments, total } = this.state.payment;
        const cuotasPosibles = included_installments.split(","); // transformado las cuotas posibles en un array

        // realizando la petición al endpoint
        const cuotasData = await checkoutService.obtenerPlanCuotas({
          importe: total,
        });

        // filtramos las cuotas de los planes recibidos
        cuotasData.map((plan) => {
          const cuotasFiltradas = plan.installmentdetail.filter(({ cuota }) =>
            cuotasPosibles.includes(String(cuota))
          );
          plan.installmentdetail = cuotasFiltradas;
        });

        commit("setPlanCuotas", cuotasData);
      }
    },

    /*
      !Metodo: pagarCheckout
      * envia la solicitud de pago con los datos del formulario guardados en el store
    */
    async pagarCheckout({ commit }, webhookData = null) {
      try {
        // eliminado espacios en blanco email
        this.state.form.holder_email = this.state.form.holder_email.trim();

        let data = webhookData;

        if (!webhookData) {
          const resp = await checkoutService.pagarCheckout(this.state.form);
          data = resp.data;
        }

        let msjError = "";

        //si hay algun error en la respuesta del pago
        if (!data.exito || data.estado == "RECHAZADO") {
          // Si en el mensaje de error aparece una referencia a el error de bin (4 ultimos digitos de la tarjeta):
          const error402 = data.estado.includes("402");

          if (!error402) {
            const binError = data.estado.includes("bin"); //validamos si el error es por el bin de la tarjeta
            const invalidCardError = data.estado.includes("invalid_card");

            // si hay algun error de bin se muestra el siguiente msj
            if (binError)
              msjError =
                "Número de tarjeta inválido. Por favor, revise los valores ingresados.";
            // si hay algun error de tarjte se muestra el siguiente msj
            else if (invalidCardError)
              msjError =
                "Tarjeta no válida. Por favor, revise el valor ingresado.";
            // si el error no es ni bin ni de tarjeta
            else msjError = data.estado.split("-")[0];
          } else {
            //se ejecuta cuando existe un error con codigo de estado 402
            msjError = data.estado.split("Descripcion: ")[1];
          }

          data = { ...data, estado: msjError, exito: false };
        }

        commit("setResultadoPago", data);
      } catch (error) {
        const resultado = {
          exito: false,
          estado_pago: "cancelado",
          description: this.state.product.description,
          importe_pagado: this.state.payment.total,
          estado: error.response.data.message,
        };

        commit("setResultadoPago", resultado);
        console.log("error: ", error);
      }

      if (this.state.form.channel !== "qr" || webhookData) {
        // para que la animacion se muestre correctamente
        this.state.mostrarAnimacion = true;

        setTimeout(() => {
          this.state.payment.currentStep = 3;
          this.state.form.channel = "";
        }, 2000);
      } else {
        // si el channel es QR se muestra el QR
        if (this.state.resultadoPago.url_qr) {
          this.state.payment.fecha_expiracion =
            this.state.resultadoPago.fecha_hora_expiracion;
          this.state.mostrarQR = true;
          this.state.mostrarAnimacion = false;
        } else {
          this.state.loading = false;
          notyf.error("No se pudo generar el QR, inténto nuevamente!");
        }
      }
    },

    // Verifica si los primeros 8 digitos de la tarjeta ingresada es valida
    async verificarBinTarjeta({}, params) {
      const { data } = await apiPasarelaBin.get("/get-scheme", { params });

      return data;
    },

    setDialogCostos({ commit }, dialog) {
      commit("setDialogCostos", dialog);
    },
    setDialogDetalle({ commit }, dialog) {
      commit("setDialogDetalle", dialog);
    },
    setTarjetas({ commit }, tarjetas) {
      commit("setTarjetas", tarjetas);
    },

    setForm({ commit }, form) {
      commit("setForm", form);
    },

    resetPago({ commit }) {
      commit("resetPago");
    },

    setLoading({ commit }, loading) {
      commit("setLoading", loading);
    },
  },
});
