import { Request, Response, NextFunction } from "express";
import { ReporteService } from "../services/reporteService.js";

const reporteService = new ReporteService();
export class ReporteController {
  getStockReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reporte = await reporteService.generarInformeStock();
      res.json({
        ok: true,
        data: reporte,
      });
    } catch (error) {
      next(error);
    }
  };

  getCajaDiariaReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reporte = await reporteService.generarInformeCajaDiaria();
      res.json({
        ok: true,
        data: reporte,
      });
    } catch (error) {
      next(error);
    }
  };

  getBalanceGeneral = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { desde, hasta } = req.query;

      const fechaDesde = desde
        ? String(desde)
        : new Date().toISOString().split("T")[0];
      const fechaHasta = hasta
        ? String(hasta)
        : new Date().toISOString().split("T")[0];

      const data = await reporteService.generarBalanceCompleto(
        fechaDesde,
        fechaHasta
      );

      res.json({
        ok: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getHistorialCompras = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { desde, hasta } = req.query;

      if (!desde || !hasta) {
        return res
          .status(400)
          .json({ ok: false, message: "Faltan las fechas desde/hasta" });
      }

      const data = await reporteService.obtenerHistorialDetallado(
        String(desde),
        String(hasta)
      );

      res.json({
        ok: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
