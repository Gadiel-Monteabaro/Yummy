import { ProductoData } from "../data/productoData.js";

const productoData = new ProductoData();

export class ProductoService {
  async listarProductos(
    id_categoria?: number,
    soloHabilitados: boolean = false
  ) {
    return await productoData.findAll(id_categoria, soloHabilitados);
  }

  async obtenerProductoPorId(id: number) {
    const producto = await productoData.findById(id);
    if (!producto) {
      throw new Error(`El producto con ID ${id} no existe.`);
    }
    return producto;
  }

  async registrarProducto(
    id_categoria: number,
    nombre: string,
    precio_venta: number,
    es_compuesto: boolean,
    items: { id_insumo: number; cantidad_necesaria: number }[]
  ) {
    const nombreMin = nombre.toLowerCase().trim();

    return await productoData.create(
      id_categoria,
      nombreMin,
      precio_venta,
      es_compuesto,
      items
    );
  }

  async actualizarProducto(
    id: number,
    id_categoria: number,
    nombre: string,
    precio_venta: number,
    es_compuesto: boolean,
    habilitado: boolean, // <--- Nuevo parámetro
    items: { id_insumo: number; cantidad_necesaria: number }[]
  ) {
    const nombreMin = nombre.toLowerCase().trim();

    const productoActualizado = await productoData.update(
      id,
      id_categoria,
      nombreMin,
      precio_venta,
      es_compuesto,
      habilitado, // <--- Pasamos el estado
      items
    );

    return productoActualizado;
  }

  async cambiarEstadoProducto(id: number, habilitado: boolean) {
    const producto = await productoData.updateStatus(id, habilitado);
    if (!producto) {
      throw new Error(`No se pudo actualizar el estado del producto ID ${id}.`);
    }
    return producto;
  }

  async eliminarProducto(id: number): Promise<void> {
    const fueEliminado = await productoData.delete(id);

    if (!fueEliminado) {
      throw new Error(`No se encontró el producto con ID ${id} para eliminar.`);
    }
  }
}
