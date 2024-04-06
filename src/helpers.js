/**
 * ! Metodo: toPesos
 * * Se encarga de transformar un monto entero a dinero local parseando los ultimos dos dígitos a decimales
 * * Ejemplo: Si se recibe 1000 devuelve ==> $ 10,00
 */

export function toPesos(monto, float = false) {
  if (!float) monto = Number(monto) / 100;
  return monto.toLocaleString("es-ar", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  });
}
