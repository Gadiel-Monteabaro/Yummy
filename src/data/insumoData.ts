import pool from "@/config/db.js";

export interface IInsumo {
  id_insumo?: number;
  nombre: string;
  stock_actual: number;
  stock_minimo: number;
  unidad_medida: string;
  precio_costo_unitario: number;
}

export class InsumoData {
  async findAll(): Promise<IInsumo[]> {
    const query =
      "SELECT id_insumo, nombre, stock_actual, stock_minimo, unidad_medida, precio_costo_unitario FROM insumos";
    const result = await pool.query(query);

    return result.rows;
  }

  async create(
    nombre: string,
    stock_actual: number,
    stock_minimo: number,
    unidad_medida: string,
    precio_costo_unitario: number
  ): Promise<IInsumo> {
    const sql = `
      INSERT INTO insumos (nombre, stock_actual, stock_minimo, unidad_medida, precio_costo_unitario) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id_insumo, nombre, stock_actual, stock_minimo, unidad_medida, precio_costo_unitario
    `;

    const values = [
      nombre,
      stock_actual,
      stock_minimo,
      unidad_medida,
      precio_costo_unitario,
    ];

    const result = await pool.query(sql, values);

    return result.rows[0];
  }

  // En tu archivo donde esta la clase InsumoData
  async update(
    id: number,
    nombre: string,
    stock_actual: number,
    stock_minimo: number,
    unidad_medida: string,
    precio_costo_unitario: number
  ): Promise<IInsumo | null> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. OBTENER EL VALOR ACTUAL ANTES DE MODIFICAR
      const resPrevio = await client.query(
        "SELECT stock_actual FROM insumos WHERE id_insumo = $1 FOR UPDATE",
        [id]
      );

      if (resPrevio.rowCount === 0) {
        throw new Error("Insumo no encontrado");
      }

      const stockViejo = parseFloat(resPrevio.rows[0].stock_actual) || 0;
      const stockNuevo = parseFloat(stock_actual.toString());
      const precioUnitario = parseFloat(precio_costo_unitario.toString());

      const diferencia = stockNuevo - stockViejo;

      const sqlUpdate = `
      UPDATE insumos 
      SET nombre = $1, stock_actual = $2, stock_minimo = $3, unidad_medida = $4, precio_costo_unitario = $5
      WHERE id_insumo = $6
      RETURNING *
    `;
      const resultUpdate = await client.query(sqlUpdate, [
        nombre,
        stockNuevo,
        stock_minimo,
        unidad_medida,
        precioUnitario,
        id,
      ]);

      if (diferencia > 0) {
        const gastoDeEstaCompra = diferencia * precioUnitario;

        await client.query(
          "INSERT INTO compras (id_insumo, cantidad_comprada, precio_pagado, fecha_compra) VALUES ($1, $2, $3, NOW())",
          [id, diferencia, gastoDeEstaCompra]
        );
      }

      await client.query("COMMIT");
      return resultUpdate.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error en la transacción de update:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const sql = "DELETE FROM insumos WHERE id_insumo = $1";
    const result = await pool.query(sql, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
