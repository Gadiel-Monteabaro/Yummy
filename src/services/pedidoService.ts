import { PedidoData } from "../data/pedidoData.js";
import type { IDetallePedido } from "../data/pedidoData.js";

const pedidoData = new PedidoData();

export class PedidoService {
  async registrarVenta(cliente: string, items: IDetallePedido[]) {
    if (!cliente || cliente.trim() === "") {
      throw new Error("El cliente es obligatorio");
    }

    if (!items || items.length === 0) {
      throw new Error("El pedido debe tener al menos un producto");
    }

    for (const item of items) {
      if (item.cantidad <= 0) {
        throw new Error(
          `Cantidad inválida para el producto ${item.id_producto}`
        );
      }
    }

    return pedidoData.create(cliente, items);
  }

  async obtenerPedidos() {
    return pedidoData.findAll();
  }

  async obtenerPedidoPorId(id: number) {
    const pedido = await pedidoData.findById(id);
    if (!pedido) {
      throw new Error("El pedido solicitado no existe");
    }
    return pedido;
  }

  async actualizarEstadoPedido(id: number, estado: string) {
    const estadoLimpio = estado.trim().normalize("NFC");

    const estadosValidos = [
      "Pendiente",
      "En Preparación",
      "Completado",
      "Entregado",
      "Cancelado",
    ];

    if (!estadosValidos.includes(estadoLimpio)) {
      throw new Error(`Estado de pedido inválido: "${estadoLimpio}"`);
    }

    const pedidoActualizado = await pedidoData.updateStatus(id, estadoLimpio);

    if (!pedidoActualizado) {
      throw new Error("No se pudo actualizar el estado del pedido");
    }

    return pedidoActualizado;
  }
}
