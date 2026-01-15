import pool from "../config/db.js";

export interface IDetallePedido {
  id_producto: number;
  cantidad: number;
  observaciones?: string;
}

export class PedidoData {
  async create(cliente: string, items: IDetallePedido[]) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const productIds = items.map((i) => i.id_producto);

      const resProductos = await client.query(
        `
        SELECT id_producto, precio_venta
        FROM productos
        WHERE id_producto = ANY($1)
        FOR UPDATE
        `,
        [productIds]
      );

      if (resProductos.rows.length !== productIds.length) {
        throw new Error("Uno o más productos no existen");
      }

      const precios = new Map<number, number>();
      resProductos.rows.forEach((p) =>
        precios.set(p.id_producto, Number(p.precio_venta))
      );

      let totalPedido = 0;

      const detalles = items.map((item) => {
        const precio = precios.get(item.id_producto)!;
        const subtotal = precio * item.cantidad;
        totalPedido += subtotal;

        return {
          ...item,
          subtotal,
          observaciones: item.observaciones ?? "",
        };
      });

      for (const item of items) {
        const resStock = await client.query(
          `
          SELECT i.id_insumo, i.stock_actual, r.cantidad_necesaria
          FROM recetas r
          JOIN insumos i ON i.id_insumo = r.id_insumo
          WHERE r.id_producto = $1
          FOR UPDATE
          `,
          [item.id_producto]
        );

        if (resStock.rows.length === 0) {
          throw new Error(
            `El producto ${item.id_producto} no tiene receta asociada`
          );
        }

        for (const row of resStock.rows) {
          const requerido = row.cantidad_necesaria * item.cantidad;

          if (row.stock_actual < requerido) {
            throw new Error(`Stock insuficiente del insumo ${row.id_insumo}`);
          }
        }
      }

      const resPedido = await client.query(
        `
        INSERT INTO pedidos (cliente, total, estado)
        VALUES ($1, $2, 'Pendiente')
        RETURNING *
        `,
        [cliente, totalPedido]
      );

      const pedido = resPedido.rows[0];

      for (const detalle of detalles) {
        await client.query(
          `
          INSERT INTO detalle_pedidos
          (id_pedido, id_producto, cantidad, subtotal, observaciones)
          VALUES ($1, $2, $3, $4, $5)
          `,
          [
            pedido.id_pedido,
            detalle.id_producto,
            detalle.cantidad,
            detalle.subtotal,
            detalle.observaciones,
          ]
        );

        await client.query(
          `
          UPDATE insumos
          SET stock_actual = stock_actual - (r.cantidad_necesaria * $1)
          FROM recetas r
          WHERE r.id_insumo = insumos.id_insumo
          AND r.id_producto = $2
          `,
          [detalle.cantidad, detalle.id_producto]
        );
      }

      await client.query("COMMIT");
      return pedido;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findAll() {
    const query = `
    SELECT 
      p.id_pedido, 
      p.cliente, 
      p.total, 
      p.estado, 
      p.fecha_hora,
      COALESCE(
        json_agg(
          json_build_object(
            'id_detalle', d.id_detalle,
            'id_producto', d.id_producto,
            'nombre', prod.nombre,
            'cantidad', d.cantidad,
            'subtotal', d.subtotal,
            'observaciones', d.observaciones
          )
        ) FILTER (WHERE d.id_detalle IS NOT NULL), '[]'
      ) AS items
    FROM pedidos p
    LEFT JOIN detalle_pedidos d ON p.id_pedido = d.id_pedido
    LEFT JOIN productos prod ON d.id_producto = prod.id_producto
    GROUP BY p.id_pedido
    ORDER BY p.fecha_hora DESC
  `;

    const res = await pool.query(query);
    return res.rows;
  }

  async findById(id: number) {
    const client = await pool.connect();

    try {
      const pedidoRes = await client.query(
        `SELECT id_pedido, cliente, total, fecha_hora, estado
       FROM pedidos
       WHERE id_pedido = $1`,
        [id]
      );

      if (pedidoRes.rows.length === 0) return null;

      const detalleRes = await client.query(
        `SELECT 
        d.id_detalle,
        d.id_producto,
        p.nombre,
        d.cantidad,
        d.subtotal,
        d.observaciones
      FROM detalle_pedidos d
      JOIN productos p ON d.id_producto = p.id_producto
      WHERE d.id_pedido = $1
      ORDER BY d.id_detalle`,
        [id]
      );

      return {
        ...pedidoRes.rows[0],
        items: detalleRes.rows,
      };
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async updateStatus(id: number, estado: string) {
    console.log("updateStatus called:", { id, estado });
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      console.log("Transaction started");

      const res = await client.query(
        `UPDATE pedidos SET estado = $1 WHERE id_pedido = $2 RETURNING *`,
        [estado, id]
      );
      console.log("Pedido updated, rowCount:", res.rowCount);

      if (res.rowCount === 0) {
        throw new Error("Pedido no encontrado");
      }

      if (estado === "Cancelado") {
        console.log("Restoring stock...");
        await client.query(
          `
        UPDATE insumos
        SET stock_actual = stock_actual + subq.total_cantidad
        FROM (
          SELECT r.id_insumo, SUM(r.cantidad_necesaria * dp.cantidad) as total_cantidad
          FROM detalle_pedidos dp
          JOIN recetas r ON dp.id_producto = r.id_producto
          WHERE dp.id_pedido = $1
          GROUP BY r.id_insumo
        ) subq
        WHERE insumos.id_insumo = subq.id_insumo
      `,
          [id]
        );
        console.log("Stock restored");
      }

      await client.query("COMMIT");
      console.log("Transaction committed");
      return res.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error al actualizar estado y stock:", error);
      throw error;
    } finally {
      client.release();
    }
  }
}
