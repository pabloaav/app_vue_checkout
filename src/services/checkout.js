import apiPasarelaCheckout from "@/api/pasarela_checkout";
import apiPasarela from "@/api/pasarela";
import apiQr from "@/api/qr";

const checkPrisma = async () => {
  const { data } = await apiPasarelaCheckout.post("/checkout/prisma");

  return data;
};

const checkout = async (uuid) => {
  const { data } = await apiPasarelaCheckout.get(`/checkout/${uuid}`);
  return data;
};

const obtenerTarjetas = async () => {
  const { data } = await apiPasarelaCheckout.get("/checkout/tarjetas/all");

  return data;
};

const obtenerPlanCuotas = async (params) => {
  const { data } = await apiPasarelaCheckout.get("/pasarela/plan-cuotas", {
    params,
  });

  return data;
};

const pagarCheckout = async (formData) => {
  const { data } = await apiPasarelaCheckout.post("/checkout/pagar", formData);

  return data;
};

const verificarPago = async (uuid) => {
  const { data } = await apiPasarelaCheckout.get(
    `/checkout/pago/estado/${uuid}`
  );
  return data;
};

const obtenerQR = async (params) => {
  const { data } = await apiQr.get("/qr/getimage", {
    params,
  });

  return data;
};

export default {
  checkPrisma,
  checkout,
  obtenerTarjetas,
  obtenerPlanCuotas,
  pagarCheckout,
  verificarPago,
  obtenerQR,
};
