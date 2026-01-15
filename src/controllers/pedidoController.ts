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
    console.log("PATCH /estado", {
      id: req.params.id,
      estado: req.body.estado,
      estadoLength: req.body.estado?.length,
      estadoBytes: Buffer.from(req.body.estado || "", "utf-8").toString("hex"),
      estadoCharCodes: req.body.estado
        ?.split("")
        .map((c: string) => c.charCodeAt(0)),
    });

    try {
      const { id } = req.params;
      const { estado } = req.body;

      const pedidoActualizado = await pedidoService.actualizarEstadoPedido(
        Number(id),
        estado
      );

      res.status(200).json({ ok: true, data: pedidoActualizado });
    } catch (error) {
      next(error);
    }
  };
}
