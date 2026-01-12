import { Router } from "express";
import { ProductoController } from "@/controllers/productController.js";
import { body } from "express-validator";
import { validateRequest } from "@/middlewares/validateRequest.js";
import { validateIdParam } from "@/validators/id.validator.js";

const router = Router();
const controller = new ProductoController();

router.get("/", controller.getAllProductos.bind(controller));

router.get(
  "/:id",
  validateIdParam("id"),
  validateRequest,
  controller.getProductoById.bind(controller)
);

router.patch(
  "/:id/status",
  validateIdParam("id"),
  body("habilitado").isBoolean().withMessage("El estado debe ser booleano"),
  validateRequest,
  controller.patchStatus.bind(controller)
);

router.post(
  "/",
  body("id_categoria").isInt().withMessage("Categoría no válida"),
  body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),
  body("precio_venta")
    .isFloat({ min: 0 })
    .withMessage("El precio debe ser positivo"),
  body("es_compuesto").isBoolean().withMessage("Debe indicar si es compuesto"),
  validateRequest,
  controller.crearProducto.bind(controller)
);

router.put(
  "/:id",
  validateIdParam("id"),
  body("id_categoria").isInt().withMessage("Categoría no válida"),
  body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),
  body("precio_venta")
    .isFloat({ min: 0 })
    .withMessage("El precio debe ser positivo"),
  body("es_compuesto").isBoolean().withMessage("Debe indicar si es compuesto"),
  body("habilitado").isBoolean().withMessage("El estado debe ser booleano"), // Agregado aquí también
  validateRequest,
  controller.actualizarProducto.bind(controller)
);

router.delete(
  "/:id",
  validateIdParam("id"),
  validateRequest,
  controller.eliminarProducto.bind(controller)
);

export default router;
