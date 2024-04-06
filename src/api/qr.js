import axios from "axios";

const baseURL = process.env.VUE_APP_ROOT_QRTELCO;
const apiQr = axios.create({ baseURL });

export default apiQr;
