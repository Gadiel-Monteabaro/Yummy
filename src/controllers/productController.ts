import { Request, Response, NextFunction } from "express";
import { ProductoService } from "@/services/productService.js";

const productoService = new ProductoService();

export class ProductoController {
  getAllProductos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id_categoria, solo_habilitados } = req.query;

      const categoriaId = id_categoria ? Number(id_categoria) : undefined;

      const soloHabilitados = solo_habilitados === "true";

      const productos = await productoService.listarProductos(
        categoriaId,
        soloHabilitados
      );

      res.json({
        ok: true,
        data: productos,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductoById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const producto = await productoService.obtenerProductoPorId(Number(id));

      return res.status(200).json({
        ok: true,
        data: producto,
      });
    } catch (error) {
      next(error);
    }
  };

  crearProducto = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id_categoria, nombre, precio_venta, es_compuesto, items } =
        req.body;
      const data = await productoService.registrarProducto(
        id_categoria,
        nombre,
        precio_venta,
        es_compuesto,
        items || []
      );
      res.status(201).json({ ok: true, data });
    } catch (error) {
      next(error);
    }
  };

  actualizarProducto = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const {
        id_categoria,
        nombre,
        precio_venta,
        es_compuesto,
        habilitado,
        items,
      } = req.body;

      const data = await productoService.actualizarProducto(
        Number(id),
        id_categoria,
        nombre,
        precio_venta,
        es_compuesto,
        habilitado,
        items || []
      );

      return res.json({
        ok: true,
        message: "Producto y receta actualizados correctamente",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  patchStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { habilitado } = req.body; // Se espera { "habilitado": true/false }

      const data = await productoService.cambiarEstadoProducto(
        Number(id),
        habilitado
      );

      return res.json({
        ok: true,
        message: `Producto ${
          habilitado ? "habilitado" : "deshabilitado"
        } correctamente`,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  eliminarProducto = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      await productoService.eliminarProducto(Number(id));

      return res.status(200).json({
        ok: true,
        message: "Producto y sus recetas asociados eliminados correctamente",
      });
    } catch (error) {
      next(error);
    }
  };
}
