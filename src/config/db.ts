import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// const pool = new Pool(
//   process.env.NODE_ENV === "production"
//     ? {
//         connectionString: process.env.DATABASE_URL,
//         ssl: { rejectUnauthorized: false },
//       }
//     : {
//         host: process.env.DB_HOST,
//         port: Number(process.env.DB_PORT),
//         user: process.env.DB_USER,
//         password: process.env.DB_PASSWORD,
//         database: process.env.DB_NAME,
//       }
// );

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  client_encoding: "UTF8",
});

pool.on("connect", () => {
  console.log("✅ DB conectada");
});

export default pool;
