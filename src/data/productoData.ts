import pool from "../config/db.js";

export class ProductoData {
  async findAll(id_categoria?: number, soloHabilitados: boolean = false) {
    let sql = `
      SELECT p.id_producto, p.id_categoria, p.nombre, p.precio_venta, p.es_compuesto, p.habilitado
      FROM productos p
      WHERE 1=1`;

    const params = [];

    if (id_categoria) {
      params.push(id_categoria);
      sql += ` AND p.id_categoria = $${params.length}`;
    }

    if (soloHabilitados) {
      sql += ` AND p.habilitado = true`;
    }

    sql += ` ORDER BY p.id_producto ASC`;

    const result = await pool.query(sql, params);
    return result.rows;
  }

  async findById(id: number) {
    const sqlProducto = `
    SELECT p.*, c.nombre as categoria_nombre 
    FROM productos p
    INNER JOIN categorias c ON p.id_categoria = c.id_categoria
    WHERE p.id_producto = $1`;
    const resProducto = await pool.query(sqlProducto, [id]);

    if (resProducto.rows.length === 0) return null;

    const producto = resProducto.rows[0];

    const sqlReceta = `
    SELECT 
      r.id_insumo, 
      i.nombre as nombre,  
      r.cantidad_necesaria, 
      i.unidad_medida
    FROM recetas r
    INNER JOIN insumos i ON r.id_insumo = i.id_insumo
    WHERE r.id_producto = $1`;
    const resReceta = await pool.query(sqlReceta, [id]);

    return {
      ...producto,
      items: resReceta.rows,
    };
  }

  // Nuevo método quirúrgico para el switch de habilitado
  async updateStatus(id: number, habilitado: boolean) {
    const sql = `
      UPDATE productos 
      SET habilitado = $1 
      WHERE id_producto = $2 
      RETURNING id_producto, habilitado`;
    const result = await pool.query(sql, [habilitado, id]);
    return result.rows[0];
  }

  async create(
    id_categoria: number,
    nombre: string,
    precio_venta: number,
    es_compuesto: boolean,
    items: { id_insumo: number; cantidad_necesaria: number }[],
  ) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Agregamos habilitado por defecto true al crear
      const sqlProducto = `
        INSERT INTO productos (id_categoria, nombre, precio_venta, es_compuesto, habilitado) 
        VALUES ($1, $2, $3, $4, true) RETURNING *`;
      const resProducto = await client.query(sqlProducto, [
        id_categoria,
        nombre,
        precio_venta,
        es_compuesto,
      ]);
      const nuevoProducto = resProducto.rows[0];

      if (items && items.length > 0) {
        const sqlReceta = `
          INSERT INTO recetas (id_producto, id_insumo, cantidad_necesaria) 
          VALUES ($1, $2, $3)`;

        for (const item of items) {
          await client.query(sqlReceta, [
            nuevoProducto.id_producto,
            item.id_insumo,
            item.cantidad_necesaria,
          ]);
        }
      }

      await client.query("COMMIT");
      return nuevoProducto;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async update(
    id: number,
    id_categoria: number,
    nombre: string,
    precio_venta: number,
    es_compuesto: boolean,
    habilitado: boolean, // Agregado parámetro
    items: { id_insumo: number; cantidad_necesaria: number }[],
  ): Promise<any> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const sqlProducto = `
        UPDATE productos 
        SET id_categoria = $1, nombre = $2, precio_venta = $3, es_compuesto = $4, habilitado = $5
        WHERE id_producto = $6
        RETURNING *`;
      const resProducto = await client.query(sqlProducto, [
        id_categoria,
        nombre,
        precio_venta,
        es_compuesto,
        habilitado,
        id,
      ]);

      if (resProducto.rows.length === 0) {
        throw new Error("Producto no encontrado");
      }

      await client.query("DELETE FROM recetas WHERE id_producto = $1", [id]);

      if (items && items.length > 0) {
        const sqlReceta = `
          INSERT INTO recetas (id_producto, id_insumo, cantidad_necesaria) 
          VALUES ($1, $2, $3)`;

        for (const item of items) {
          await client.query(sqlReceta, [
            id,
            item.id_insumo,
            item.cantidad_necesaria,
          ]);
        }
      }

      await client.query("COMMIT");
      return resProducto.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id: number) {
    const sql = "DELETE FROM productos WHERE id_producto=$1";
    const result = await pool.query(sql, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
