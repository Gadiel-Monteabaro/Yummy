import { Router } from "express";
import { PedidoController } from "../controllers/pedidoController.js";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validateRequest.js";
import { validateIdParam } from "../validators/id.validator.js";

const router = Router();
const controller = new PedidoController();

router.get("/", controller.obtenerPedidos.bind(controller));

router.get(
  "/:id",
  validateIdParam("id"),
  validateRequest,
  controller.obtenerPedidoPorId.bind(controller)
);

router.post(
  "/",
  body("cliente")
    .trim()
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio")
    .isLength({ min: 3 })
    .withMessage("El nombre debe tener al menos 3 caracteres"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("El pedido debe contener al menos un producto"),
  body("items.*.id_producto")
    .isInt({ gt: 0 })
    .withMessage("ID de producto no válido"),
  body("items.*.cantidad")
    .isInt({ gt: 0 })
    .withMessage("La cantidad debe ser un número entero mayor a 0"),
  body("items.*.observaciones_item")
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage("La nota del producto es muy larga"),
  validateRequest,
  controller.crearPedido.bind(controller)
);

router.patch(
  "/:id/estado",
  validateIdParam("id"),
  body("estado")
    .isIn([
      "Pendiente",
      "En Preparacion",
      "Completado",
      "Entregado",
      "Cancelado",
    ])
    .withMessage("Estado de pedido inválido"),
  validateRequest,
  controller.actualizarEstadoPedido.bind(controller)
);

export default router;
