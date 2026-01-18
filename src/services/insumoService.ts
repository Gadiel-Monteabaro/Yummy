import { InsumoData } from "../data/insumoData.js";
import { IInsumo } from "../data/insumoData.js";

// Instanciamos la capa de datos
const insumoData = new InsumoData();

export class InsumoService {
  async listarInsumos(): Promise<IInsumo[]> {
    return await insumoData.getAll();
  }

  async registrarInsumo(
    nombre: string,
    stock_actual: number,
    stock_minimo: number,
    unidad_medida: string,
    precio_costo_unitario: number
  ): Promise<IInsumo> {
    const nombreEnMinuscula = nombre.toLowerCase().trim();

    const todos = await insumoData.getAll();
    const existe = todos.find((i) => i.nombre === nombreEnMinuscula);

    if (existe) {
      throw new Error(`El insumo '${nombreEnMinuscula}' ya existe.`);
    }

    return await insumoData.create(
      nombreEnMinuscula,
      stock_actual,
      stock_minimo,
      unidad_medida,
      precio_costo_unitario
    );
  }

  async actualizarInsumo(
    id: number,
    nombre: string,
    stock_actual: number,
    stock_minimo: number,
    unidad_medida: string,
    precio_costo_unitario: number
  ) {
    const insumoActualizado = await insumoData.update(
      id,
      nombre,
      stock_actual,
      stock_minimo,
      unidad_medida,
      precio_costo_unitario
    );

    if (!insumoActualizado) {
      throw new Error("Insumo no encontrado");
    }

    return insumoActualizado;
  }

  async registrarCompra(
    id: number,
    cantidad_comprada: number,
    precio_costo_unitario: number
  ) {
    const insumoActualizado = await insumoData.addStock(
      id,
      cantidad_comprada,
      precio_costo_unitario
    );

    if (!insumoActualizado) {
      throw new Error("Insumo no encontrado");
    }

    return insumoActualizado;
  }

  async eliminarInsumo(id: number): Promise<void> {
    await insumoData.delete(id);
  }
}
