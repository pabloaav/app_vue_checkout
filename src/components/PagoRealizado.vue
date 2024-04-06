<template>
  <div class="container">
    <img src="@/assets/wee_logo.png" width="250px" class="image" />

    <div cols="12" class="msj-container">
      <p class="text-center px-2">
        {{ payment.message }}
      </p>
    </div>
    <div>
      <p class="text-center">
        Gracias por elegirnos! Cualquier duda o consulta, por favor comuniquese
        con nosotros:
      </p>
      <p class="font-weight-bold text-center text-h6 soporte">
        reclamoswee@telco.com.ar
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  computed: {
    ...mapGetters(["payment"]),
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
}
.msj-container {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 80%;
  max-height: 140px !important;

  border: 1px solid #a6b014;
  background: #c2d500;
  color: #2d2f14;
  text-transform: uppercase;
}

@media (max-width: 420px) {
  .container {
    max-width: 100%;
    gap: 30px;
  }
  .image {
    transform: scale(0.6);
  }
  .msj-container {
    max-width: 100%;
    font-size: 16px;
  }

  .soporte {
    font-size: 15px !important;
  }
}
</style>
