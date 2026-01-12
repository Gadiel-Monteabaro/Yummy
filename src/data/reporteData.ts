import pool from "../config/db.js";

export class ReportData {
  async getStockCritico() {
    const result = await pool.query(`
            SELECT id_insumo, nombre, stock_actual, stock_minimo, (stock_minimo - stock_actual) AS faltante
            FROM insumos 
            WHERE stock_actual <= stock_minimo
            ORDER BY faltante DESC
            `);

    return result.rows;
  }

  async valorInventario() {
    const result = await pool.query(`
            SELECT SUM(stock_actual * precio_costo_unitario) AS valor_total_inventario
            FROM insumos
            `);
    return result.rows[0];
  }

  async getCajaDiaria() {
    const ingresos = `
      SELECT COALESCE(SUM(total), 0) as total_ventas 
      FROM pedidos 
      WHERE fecha_hora::date = CURRENT_DATE 
      AND estado != 'Cancelado'
    `;

    const egresos = `
  SELECT COALESCE(SUM(precio_pagado), 0) as total_compras 
  FROM compras 
  WHERE fecha_compra::date = CURRENT_DATE     
`;

    const ingresosResult = await pool.query(ingresos);
    const egresosResult = await pool.query(egresos);

    const ventas = parseFloat(ingresosResult.rows[0].total_ventas);
    const compras = parseFloat(egresosResult.rows[0].total_compras);

    return {
      ingresos: ventas,
      egresos: compras,
      balance: ventas - compras,
    };
  }

  async getBalanceRango(desde: string, hasta: string) {
    const sqlVentas = `
    SELECT COUNT(id_pedido) as cant_ventas,
    COALESCE(SUM(total), 0) as total_ingresos
    FROM pedidos
    WHERE fecha_hora::date BETWEEN $1 AND $2
    AND estado != 'Cancelado'
    `;

    const sqlCompras = `SELECT 
    COUNT(id_compra) as cant_compras,
    COALESCE(SUM(precio_pagado), 0) as total_egresos
    FROM compras
    WHERE fecha_compra::date BETWEEN $1 AND $2`;

    const ventasResult = await pool.query(sqlVentas, [desde, hasta]);
    const comprasResult = await pool.query(sqlCompras, [desde, hasta]);

    const ingresos = parseFloat(ventasResult.rows[0].total_ingresos);
    const egresos = parseFloat(comprasResult.rows[0].total_egresos);

    return {
      periodo: { desde, hasta },
      ventas: {
        cantidad: parseInt(ventasResult.rows[0].cant_ventas, 10),
        total: ingresos,
      },
      compras: {
        cantidad: parseInt(comprasResult.rows[0].cant_compras, 10),
        total: egresos,
      },
      ganancia_neta: {
        total: ingresos - egresos,
      },
    };
  }

  async getHistorialCompras(desde: string, hasta: string) {
    const sql = `
    SELECT 
      c.id_compra,
      c.fecha_compra,
      i.nombre AS insumo_nombre,
      c.cantidad_comprada,
      c.precio_pagado AS total_compra,
      i.unidad_medida
    FROM compras c
    JOIN insumos i ON c.id_insumo = i.id_insumo
    WHERE c.fecha_compra::date BETWEEN $1 AND $2
    ORDER BY c.fecha_compra DESC
  `;
    const result = await pool.query(sql, [desde, hasta]);
    return result.rows;
  }
}
