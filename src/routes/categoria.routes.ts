import { Router } from "express";
import { CategoriaController } from "../controllers/categoriasController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { body } from "express-validator";
import { validateIdParam } from "../validators/id.validator.js";

const router = Router();
const controller = new CategoriaController();

router.get("/", controller.listarCategorias);

export default router;
