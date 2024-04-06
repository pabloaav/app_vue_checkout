import axios from "axios";

const baseURL = process.env.VUE_APP_ROOT_PASARELA;
const apiPasarela = axios.create({ baseURL });

export default apiPasarela;
