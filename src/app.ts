import express from "express";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import insumoRoutes from "./routes/insumo.routes.js";
import productoRoutes from "./routes/producto.routes.js";
import pedidoRoutes from "./routes/pedido.routes.js";
import compraRoutes from "./routes/compra.routes.js";
import reporteRoutes from "./routes/reporte.routes.js";
import categoriaRoutes from "./routes/categoria.routes.js";
import cors from "cors";

const app = express();

const opcionesCors = {
  origin: [
    "https://yummy-rc69.onrender.com",
    "https://yummy-frontend-sigma.vercel.app/",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(opcionesCors));
app.use(express.json());

app.use("/api/categorias", categoriaRoutes);
app.use("/api/insumos", insumoRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/compras", compraRoutes);
app.use("/api/reporte", reporteRoutes);

app.use(errorMiddleware);

export default app;
