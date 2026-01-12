import app from "./app.js";
import pool from "./config/db.js"; // ¡No olvides importar tu pool!

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("Conexión a la Base de Datos: OK");

    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error crítico al iniciar el servidor:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Ocurrió un error desconocido", error);
    }

    process.exit(1);
  }
}

startServer();
