import { Request, Response, NextFunction } from "express";
import { PedidoService } from "../services/pedidoService.js";

const pedidoService = new PedidoService();

export class PedidoController {
  crearPedido = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cliente, items } = req.body;
      const pedido = await pedidoService.registrarVenta(cliente, items);
      res.status(201).json({ ok: true, data: pedido });
    } catch (error) {
      next(error);
    }
  };

  obtenerPedidos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pedidos = await pedidoService.obtenerPedidos();
      res.status(200).json({ ok: true, data: pedidos });
    } catch (error) {
      next(error);
    }
  };

  obtenerPedidoPorId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const pedido = await pedidoService.obtenerPedidoPorId(Number(id));
      res.status(200).json({ ok: true, data: pedido });
    } catch (error) {
      next(error);
    }
  };

  actualizarEstadoPedido = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const pedidoActualizado = await pedidoService.actualizarEstadoPedido(
        Number(id),
        estado
      );

      res.status(200).json({ ok: true, data: pedidoActualizado }) ;
    } catch (error) {
      next(error);
    }
  };
}
