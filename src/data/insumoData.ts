import pool from "../config/db.js";

export interface IInsumo {
  id_insumo: number;
  nombre: string;
  stock_actual: number;
  stock_minimo: number;
  unidad_medida: string;
  precio_costo_unitario: number;
  activo: boolean;
}

export class InsumoData {
  async getAll(): Promise<IInsumo[]> {
    const sql = `
    SELECT * FROM insumos 
    WHERE activo = true 
    ORDER BY nombre
  `;
    const result = await pool.query(sql);
    return result.rows;
  }

  async create(
    nombre: string,
    stock_actual: number,
    stock_minimo: number,
    unidad_medida: string,
    precio_costo_unitario: number,
  ): Promise<IInsumo> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const sql = `
      INSERT INTO insumos (nombre, stock_actual, stock_minimo, unidad_medida, precio_costo_unitario, activo) 
      VALUES ($1, $2, $3, $4, $5, true) 
      RETURNING *
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
          [nuevoInsumo.id_insumo, stock_actual, gastoInicial],
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
    precio_costo_unitario: number,
  ): Promise<IInsumo | null> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const checkCompras = await client.query(
        "SELECT COUNT(*) as total FROM compras WHERE id_insumo = $1",
        [id],
      );

      const cantidadCompras = parseInt(checkCompras.rows[0].total);

      const sqlUpdate = `
      UPDATE insumos 
      SET nombre = $1, 
          stock_actual = $2, 
          stock_minimo = $3, 
          unidad_medida = $4, 
          precio_costo_unitario = $5
      WHERE id_insumo = $6 AND activo = true
      RETURNING *
    `;

      const result = await pool.query(sqlUpdate, [
        nombre,
        stock_actual,
        stock_minimo,
        unidad_medida,
        precio_costo_unitario,
        id,
      ]);

      if (result.rowCount === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      if (cantidadCompras === 1) {
        const nuevoPrecioTotal = stock_actual * precio_costo_unitario;

        await client.query(
          `UPDATE compras 
         SET cantidad_comprada = $1, 
             precio_pagado = $2
         WHERE id_insumo = $3`,
          [stock_actual, nuevoPrecioTotal, id],
        );

        console.log("Compra inicial actualizada:", {
          cantidad: stock_actual,
          precio_unitario: precio_costo_unitario,
          total: nuevoPrecioTotal,
        });
      } else if (cantidadCompras > 1) {
        console.log(
          "Tiene múltiples compras, no se actualiza historial automáticamente",
        );
      }

      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error al actualizar insumo:", error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  async addStock(
    id: number,
    cantidad_comprada: number,
    precio_costo_unitario: number,
  ): Promise<IInsumo | null> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Obtener stock actual (solo si está activo)
      const resPrevio = await client.query(
        "SELECT stock_actual FROM insumos WHERE id_insumo = $1 AND activo = true FOR UPDATE",
        [id],
      );

      if (resPrevio.rowCount === 0) {
        throw new Error("Insumo no encontrado o inactivo");
      }

      const stockActual = parseFloat(resPrevio.rows[0].stock_actual) || 0;
      const cantidadComprada = parseFloat(cantidad_comprada.toString());
      const precioUnitario = parseFloat(precio_costo_unitario.toString());
      const nuevoStock = stockActual + cantidadComprada;

      const sqlUpdate = `
      UPDATE insumos 
      SET stock_actual = $1, precio_costo_unitario = $2
      WHERE id_insumo = $3 AND activo = true
      RETURNING *
    `;

      const resultUpdate = await client.query(sqlUpdate, [
        nuevoStock,
        precioUnitario,
        id,
      ]);

      if (cantidadComprada > 0) {
        const gastoDeEstaCompra = cantidadComprada * precioUnitario;

        await client.query(
          `INSERT INTO compras (id_insumo, cantidad_comprada, precio_pagado, fecha_compra) 
         VALUES ($1, $2, $3, NOW())`,
          [id, cantidadComprada, gastoDeEstaCompra],
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

  async delete(id: number): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      console.log("=== INTENTANDO ELIMINAR INSUMO ===");
      console.log("ID:", id);

      // 1. Verificar si está en recetas
      const checkRecetas = await client.query(
        "SELECT COUNT(*) as total FROM recetas WHERE id_insumo = $1",
        [id],
      );

      const tieneRecetas = parseInt(checkRecetas.rows[0].total) > 0;
      console.log("Tiene recetas:", tieneRecetas);

      // 2. Si NO está en recetas, eliminar físicamente (incluye sus compras)
      if (!tieneRecetas) {
        console.log("✅ Eliminando físicamente (sin uso en recetas)");

        // Primero eliminar las compras asociadas
        const deleteCompras = await client.query(
          "DELETE FROM compras WHERE id_insumo = $1",
          [id],
        );
        console.log("Compras eliminadas:", deleteCompras.rowCount);

        // Luego eliminar el insumo
        const result = await client.query(
          "DELETE FROM insumos WHERE id_insumo = $1",
          [id],
        );

        if (result.rowCount === 0) {
          throw new Error("Insumo no encontrado");
        }

        await client.query("COMMIT");
        console.log("Insumo y sus compras eliminados completamente");
        return;
      }

      // 3. Si está en recetas, solo borrado lógico
      console.log("⚠️ Borrado lógico (tiene recetas asociadas)");
      const result = await client.query(
        "UPDATE insumos SET activo = false WHERE id_insumo = $1 AND activo = true",
        [id],
      );

      if (result.rowCount === 0) {
        throw new Error("Insumo no encontrado o ya está inactivo");
      }

      await client.query("COMMIT");
      console.log(
        "Insumo marcado como inactivo (mantiene compras para historial)",
      );
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error en delete:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  async restore(id: number): Promise<IInsumo | null> {
    const sql = `
    UPDATE insumos 
    SET activo = true 
    WHERE id_insumo = $1
    RETURNING *
  `;

    const result = await pool.query(sql, [id]);

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  }

  async getAllInactive(): Promise<IInsumo[]> {
    const sql = `
    SELECT * FROM insumos 
    WHERE activo = false 
    ORDER BY nombre
  `;
    const result = await pool.query(sql);
    return result.rows;
  }
}
