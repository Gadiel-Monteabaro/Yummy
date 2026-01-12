import { CategoriaService } from "@/services/categoriaService.js";
import { NextFunction, Request, Response } from "express";

const categoriaService = new CategoriaService();

export class CategoriaController {
  listarCategorias = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const categorias = await categoriaService.listarCategorias();
      res.status(200).json({
        ok: true,
        data: categorias,
      });
    } catch (error) {
      next(error);
    }
  };
}
