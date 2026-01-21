import { Router } from "express";
import { CompraController } from "../controllers/compraController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { body } from "express-validator";
import { validateIdParam } from "../validators/id.validator.js";

const router = Router();
const controller = new CompraController();

router.get("/", controller.listarCompras);
router.get(
  "/:id_compra",
  validateIdParam("id_compra"),
  validateRequest,
  controller.obtenerCompraPorId,
);

router.post(
  "/",
  body("id_insumo")
    .notEmpty()
    .withMessage("El ID del insumo es obligatorio")
    .isInt()
    .withMessage("El ID del insumo debe ser un número entero"),
  body("cantidad_comprada")
    .notEmpty()
    .withMessage("La cantidad es obligatoria")
    .isFloat({ min: 0.01 })
    .withMessage("La cantidad debe ser un número mayor a 0"),
  body("precio_pagado")
    .notEmpty()
    .withMessage("El precio es obligatorio")
    .isFloat({ min: 0 })
    .withMessage("El precio no puede ser negativo"),

  validateRequest,
  controller.registrarCompra,
);

router.patch(
  "/:id",
  validateIdParam("id"),
  body("cantidad_comprada")
    .isFloat({ min: 0.01 })
    .withMessage("La cantidad debe ser mayor a 0"),
  body("precio_pagado")
    .isFloat({ min: 0.01 })
    .withMessage("El precio debe ser mayor a 0"),
  validateRequest,
  controller.actualizarCompra.bind(controller),
);

router.delete(
  "/:id_compra",
  validateIdParam("id_compra"),
  validateRequest,
  controller.eliminarCompra,
);

export default router;
