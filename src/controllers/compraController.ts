import { Request, Response, NextFunction } from "express";
import { CompraService } from "../services/compraService.js";

const compraService = new CompraService();

export class CompraController {
  listarCompras = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const compras = await compraService.listarCompras();
      res.status(200).json({
        ok: true,
        data: compras,
      });
    } catch (error) {
      next(error);
    }
  };

  obtenerCompraPorId = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const id_compra = parseInt(req.params.id_compra, 10);
      const compra = await compraService.obtenerCompraPorId(id_compra);

      res.status(200).json({
        ok: true,
        data: compra,
      });
    } catch (error) {
      next(error);
    }
  };

  registrarCompra = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id_insumo, cantidad_comprada, precio_pagado } = req.body;

      const nuevaCompra = await compraService.registrarCompra(
        id_insumo,
        cantidad_comprada,
        precio_pagado,
      );

      res.status(201).json({
        ok: true,
        message: "Compra registrada y stock actualizado",
        data: nuevaCompra,
      });
    } catch (error) {
      next(error);
    }
  };
  
  actualizarCompra = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const { cantidad_comprada, precio_pagado } = req.body;

      const compraActualizada = await compraService.actualizarCompra(
        Number(id),
        cantidad_comprada,
        precio_pagado,
      );

      return res.status(200).json({
        message: "Compra actualizada correctamente",
        data: compraActualizada,
      });
    } catch (error) {
      next(error);
    }
  };

  eliminarCompra = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id_compra = parseInt(req.params.id_compra, 10);
      const resultado = await compraService.eliminarCompra(id_compra);

      res.status(200).json({
        ok: true,
        message: resultado.message,
      });
    } catch (error) {
      next(error);
    }
  };
}
