import pool from "../config/db.js";

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
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

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

      const result = await client.query(sql, values);
      const nuevoInsumo = result.rows[0];

      // Si se creó con stock inicial, registrar la compra
      if (stock_actual > 0) {
        const gastoInicial = stock_actual * precio_costo_unitario;

        await client.query(
          `INSERT INTO compras (id_insumo, cantidad_comprada, precio_pagado, fecha_compra) 
           VALUES ($1, $2, $3, NOW())`,
          [nuevoInsumo.id_insumo, stock_actual, gastoInicial]
        );
      }

      await client.query("COMMIT");
      return nuevoInsumo;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error al crear insumo:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  async update(
    id: number,
    nombre: string,
    stock_actual: number,
    stock_minimo: number,
    unidad_medida: string,
    precio_costo_unitario: number
  ): Promise<IInsumo | null> {
    const sql = `
    UPDATE insumos 
    SET nombre = $1, 
        stock_actual = $2,
        stock_minimo = $3, 
        unidad_medida = $4, 
        precio_costo_unitario = $5
    WHERE id_insumo = $6
    RETURNING *
  `;

    const result = await pool.query(sql, [
      nombre,
      stock_actual,
      stock_minimo,
      unidad_medida,
      precio_costo_unitario,
      id,
    ]);

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  }

  async addStock(
    id: number,
    cantidad_comprada: number,
    precio_costo_unitario: number
  ): Promise<IInsumo | null> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Obtener stock actual
      const resPrevio = await client.query(
        "SELECT stock_actual FROM insumos WHERE id_insumo = $1 FOR UPDATE",
        [id]
      );

      if (resPrevio.rowCount === 0) {
        throw new Error("Insumo no encontrado");
      }

      const stockActual = parseFloat(resPrevio.rows[0].stock_actual) || 0;
      const cantidadComprada = parseFloat(cantidad_comprada.toString());
      const precioUnitario = parseFloat(precio_costo_unitario.toString());

      // 2. Calcular nuevo stock
      const nuevoStock = stockActual + cantidadComprada;

      // 3. Actualizar stock y precio
      const sqlUpdate = `
      UPDATE insumos 
      SET stock_actual = $1, precio_costo_unitario = $2
      WHERE id_insumo = $3
      RETURNING *
    `;

      const resultUpdate = await client.query(sqlUpdate, [
        nuevoStock,
        precioUnitario,
        id,
      ]);

      // 4. Registrar la compra
      if (cantidadComprada > 0) {
        const gastoDeEstaCompra = cantidadComprada * precioUnitario;

        await client.query(
          `INSERT INTO compras (id_insumo, cantidad_comprada, precio_pagado, fecha_compra) 
         VALUES ($1, $2, $3, NOW())`,
          [id, cantidadComprada, gastoDeEstaCompra]
        );
      }

      await client.query("COMMIT");
      return resultUpdate.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error al agregar stock:", error);
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
