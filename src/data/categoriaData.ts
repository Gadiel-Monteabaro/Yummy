import pool from "../config/db.js";

export class CategoriaData {
  async findAll() {
    const result = await pool.query(`
            SELECT id_categoria, nombre FROM categorias ORDER BY nombre ASC`);
    return result.rows;
  }
}
