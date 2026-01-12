import { ReportData } from "@/data/reporteData.js";

const reporteData = new ReportData();

export class ReporteService {
  async generarInformeStock() {
    const criticos = await reporteData.getStockCritico();
    const valor_total_inventario = await reporteData.valorInventario();

    return {
      fechaReporte: new Date(),
      insumosAComprar: criticos,
      totalItemsCriticos: criticos.length,
      valorEstimadoInventario:
        valor_total_inventario.valor_total_inventario || 0,
    };
  }

  async generarInformeCajaDiaria() {
    const cajaDiaria = await reporteData.getCajaDiaria();
    return {
      fecha: new Date().toISOString().split("T")[0],
      ...cajaDiaria,
      mensaje:
        cajaDiaria.balance >= 0
          ? "El día cerró con ganancias."
          : "El día cerró con pérdidas.",
    };
  }

  async generarBalanceCompleto(desde: string, hasta: string) {
    const balance = await reporteData.getBalanceRango(desde, hasta);

    return {
      ...balance,
    };
  }

  async obtenerHistorialDetallado(desde: string, hasta: string) {
    const historial = await reporteData.getHistorialCompras(desde, hasta);

    const totalInvertido = historial.reduce(
      (acc, curr) => acc + parseFloat(curr.total_compra),
      0
    );

    return {
      lista: historial,
      total_periodo: totalInvertido,
      conteo: historial.length,
    };
  }
}
