import axios from "axios";

const baseURL = process.env.VUE_APP_ROOT_PASARELA_CHECKOUT;
const apiPasarelaCheckout = axios.create({ baseURL });

export default apiPasarelaCheckout;
