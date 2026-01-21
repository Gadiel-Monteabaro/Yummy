import { CompraData } from "../data/compraData.js";

const compraData = new CompraData();

export class CompraService {
  async listarCompras() {
    return await compraData.findAll();
  }

  async obtenerCompraPorId(id_compra: number) {
    return await compraData.findById(id_compra);
  }

  async registrarCompra(
    id_insumo: number,
    cantidad: number,
    precioNuevo: number,
  ) {
    if (!id_insumo) throw new Error("El ID del insumo es obligatorio");
    if (cantidad <= 0) throw new Error("La cantidad debe ser mayor a cero");
    if (precioNuevo < 0) throw new Error("El precio no puede ser negativo");

    return await compraData.crear(id_insumo, cantidad, precioNuevo);
  }

  async actualizarCompra(
    id: number,
    cantidad_comprada: number,
    precio_pagado: number,
  ) {
    const compraActualizada = await compraData.update(
      id,
      cantidad_comprada,
      precio_pagado,
    );

    return compraActualizada;
  }

  eliminarCompra(id_compra: number) {
    return compraData.delete(id_compra);
  }
}
