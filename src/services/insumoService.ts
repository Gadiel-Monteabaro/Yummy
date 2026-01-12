import { InsumoData } from "@/data/insumoData.js";
import { IInsumo } from "@/data/insumoData.js";

// Instanciamos la capa de datos
const insumoData = new InsumoData();

export class InsumoService {
  async listarInsumos(): Promise<IInsumo[]> {
    return await insumoData.findAll();
  }

  async registrarInsumo(
    nombre: string,
    stock_actual: number,
    stock_minimo: number,
    unidad_medida: string,
    precio_costo_unitario: number
  ): Promise<IInsumo> {
    const nombreEnMinuscula = nombre.toLowerCase().trim();

    const todos = await insumoData.findAll();
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
  ): Promise<IInsumo> {
    const nombreMin = nombre.toLowerCase().trim();

    const insumoActualizado = await insumoData.update(
      id,
      nombreMin,
      stock_actual,
      stock_minimo,
      unidad_medida,
      precio_costo_unitario
    );

    if (!insumoActualizado) {
      throw new Error(`No se encontró el insumo con ID ${id} para actualizar.`);
    }

    return insumoActualizado;
  }

  async eliminarInsumo(id: number): Promise<void> {
    const eliminado = await insumoData.delete(id);
    if (!eliminado) {
      throw new Error(`No se pudo eliminar: El insumo con ID ${id} no existe.`);
    }
  }
}
