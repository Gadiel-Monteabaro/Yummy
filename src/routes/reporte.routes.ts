import { Router } from "express";
import { ReporteController } from "@/controllers/reporteController.js";
import { query } from "express-validator";
import { validateRequest } from "@/middlewares/validateRequest.js";

const router = Router();
const controller = new ReporteController();

router.get("/stock", controller.getStockReport.bind(controller));
router.get("/caja-diaria", controller.getCajaDiariaReport.bind(controller));
router.get(
  "/balance",
  query("desde").isISO8601().withMessage("Fecha 'desde' inválida"),
  query("hasta").isISO8601().withMessage("Fecha 'hasta' inválida"),
  validateRequest,
  validateRequest,
  controller.getBalanceGeneral.bind(controller)
);
router.get(
  "/historial-compras",
  [
    query("desde").isISO8601().withMessage("Fecha 'desde' inválida"),
    query("hasta").isISO8601().withMessage("Fecha 'hasta' inválida"),
    validateRequest,
  ],
  controller.getHistorialCompras.bind(controller)
);

export default router;
