import { Request, Response, NextFunction } from "express";
import { InsumoService } from "../services/insumoService.js";
const insumoService = new InsumoService();

export class InsumoController {
  async getAllInsumos(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await insumoService.listarInsumos();
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async createInsumo(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        nombre,
        stock_actual,
        stock_minimo,
        unidad_medida,
        precio_costo_unitario,
      } = req.body;

      const result = await insumoService.registrarInsumo(
        nombre,
        stock_actual,
        stock_minimo,
        unidad_medida,
        precio_costo_unitario
      );

      return res.status(201).json({
        message: "Insumo creado exitosamente",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  actualizarInsumo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const {
        nombre,
        stock_actual,
        stock_minimo, // ← Eliminé stock_actual
        unidad_medida,
        precio_costo_unitario,
      } = req.body;

      const resultado = await insumoService.actualizarInsumo(
        Number(id),
        nombre,
        stock_actual,
        stock_minimo,
        unidad_medida,
        precio_costo_unitario
      );

      return res
        .status(200)
        .json({ message: "Insumo actualizado", data: resultado });
    } catch (error) {
      next(error);
    }
  };

  registrarCompra = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { cantidad_comprada, precio_costo_unitario } = req.body;

      const resultado = await insumoService.registrarCompra(
        Number(id),
        cantidad_comprada,
        precio_costo_unitario
      );

      return res
        .status(200)
        .json({ message: "Compra registrada exitosamente", data: resultado });
    } catch (error) {
      next(error);
    }
  };

  eliminarInsumo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await insumoService.eliminarInsumo(Number(id));
      return res
        .status(200)
        .json({ message: "Insumo marcado como inactivo correctamente" }); // ← Cambié el mensaje
    } catch (error) {
      next(error);
    }
  };
}
