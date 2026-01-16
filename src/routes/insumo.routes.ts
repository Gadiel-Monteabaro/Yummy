import { Router } from "express";
import { InsumoController } from "../controllers/insumoController.js";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validateRequest.js";
import { validateIdParam } from "../validators/id.validator.js";

const router = Router();
const controller = new InsumoController();

router.get("/", controller.getAllInsumos.bind(controller));

router.post(
  "/",
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre del insumo es obligatorio")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre debe tener entre 3 y 50 caracteres"),
  body("stock_actual")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El stock actual no puede ser negativo"),
  body("stock_minimo")
    .notEmpty()
    .withMessage("El stock mínimo es requerido para alertas")
    .isFloat({ min: 0 })
    .withMessage("El stock mínimo no puede ser negativo"),
  body("unidad_medida")
    .trim()
    .notEmpty()
    .withMessage("La unidad de medida es obligatoria (kg, l, unidad, etc.)")
    .isLength({ max: 10 })
    .withMessage("La unidad es demasiado larga"),
  body("precio_costo_unitario")
    .notEmpty()
    .withMessage("El precio de costo es obligatorio")
    .isFloat({ min: 0 })
    .withMessage("El precio no puede ser negativo"),
  validateRequest,
  controller.createInsumo.bind(controller)
);

// Editar datos básicos del insumo (sin tocar stock)
router.patch(
  // ← Cambié de PUT a PATCH
  "/:id",
  validateIdParam("id"),
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre del insumo es obligatorio")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre debe tener entre 3 y 50 caracteres"),
  body("stock_actual")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El stock actual no puede ser negativo"),
  body("stock_minimo")
    .notEmpty()
    .withMessage("El stock mínimo es requerido para alertas")
    .isFloat({ min: 0 })
    .withMessage("El stock mínimo no puede ser negativo"),
  body("unidad_medida")
    .trim()
    .notEmpty()
    .withMessage("La unidad de medida es obligatoria (kg, l, unidad, etc.)")
    .isLength({ max: 10 })
    .withMessage("La unidad es demasiado larga"),
  body("precio_costo_unitario")
    .notEmpty()
    .withMessage("El precio de costo es obligatorio")
    .isFloat({ min: 0 })
    .withMessage("El precio no puede ser negativo"),
  validateRequest,
  controller.actualizarInsumo.bind(controller)
);

router.post(
  "/:id/compra",
  validateIdParam("id"),
  body("cantidad_comprada")
    .notEmpty()
    .withMessage("La cantidad comprada es obligatoria")
    .isFloat({ min: 0.01 })
    .withMessage("La cantidad debe ser mayor a 0"),
  body("precio_costo_unitario")
    .notEmpty()
    .withMessage("El precio de costo es obligatorio")
    .isFloat({ min: 0.01 })
    .withMessage("El precio debe ser mayor a 0"),
  validateRequest,
  controller.registrarCompra.bind(controller)
);

router.delete(
  "/:id",
  validateIdParam("id"),
  validateRequest,
  controller.eliminarInsumo.bind(controller)
);

export default router;
