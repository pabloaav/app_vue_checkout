import axios from "axios";

const baseURL = process.env.VUE_APP_ROOT_PASARELA_BIN;
const apiPasarelaBin = axios.create({ baseURL });

export default apiPasarelaBin;
