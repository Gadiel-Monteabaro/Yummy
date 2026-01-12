import pool from "@/config/db.js";

export class CompraData {
  async findAll() {
    const result = await pool.query(
      "SELECT c.id_compra, c.id_insumo, c.cantidad_comprada, c.precio_pagado, c.fecha_compra, i.nombre as nombre_insumo FROM compras c JOIN insumos i ON c.id_insumo = i.id_insumo ORDER BY c.fecha_compra DESC"
    );

    return result.rows;
  }

  async findById(id_compra: number) {
    const result = await pool.query(
      `
        SELECT c.id_compra, c.id_insumo, c.cantidad_comprada, c.precio_pagado, c.fecha_compra, i.nombre as nombre_insumo 
        FROM compras c 
        JOIN insumos i ON c.id_insumo = i.id_insumo 
        WHERE c.id_compra = $1
    `,
      [id_compra]
    );

    return result.rows[0];
  }

  async crear(id_insumo: number, cantidad: number, precioNuevo: number) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        "INSERT INTO compras (id_insumo, cantidad_comprada, precio_pagado) VALUES ($1, $2, $3)",
        [id_insumo, cantidad, precioNuevo]
      );

      const sqlUpdateInsumo = `
      UPDATE insumos 
      SET stock_actual = stock_actual + $1,
          precio_costo_unitario = $2 
      WHERE id_insumo = $3`;

      await client.query(sqlUpdateInsumo, [cantidad, precioNuevo, id_insumo]);

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id_compra: number) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const resCompra = await client.query(
        "SELECT id_insumo, cantidad_comprada FROM compras WHERE id_compra = $1",
        [id_compra]
      );

      if (resCompra.rowCount === 0) {
        throw new Error("Compra no encontrada");
      }

      const { id_insumo, cantidad_comprada } = resCompra.rows[0];

      await client.query(
        "UPDATE insumos SET stock_actual = stock_actual - $1 WHERE id_insumo = $2",
        [cantidad_comprada, id_insumo]
      );

      await client.query("DELETE FROM compras WHERE id_compra = $1", [
        id_compra,
      ]);

      await client.query("COMMIT");

      return { message: "Compra eliminada correctamente" };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
