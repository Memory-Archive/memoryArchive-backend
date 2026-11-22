import "reflect-metadata";
import mysql2 from "mysql2";
import { DataSource } from "typeorm";
import { env } from "../config/env";
import { entities } from "./models";

// `timezone: "Z"` below only covers dates the app sends/reads. Columns filled by MySQL
// itself (DEFAULT CURRENT_TIMESTAMP, ON UPDATE) use the session time zone, which is the
// server's local zone unless configured. Force every pooled connection to UTC on open.
// mysql2 emits "connection" before handing a new connection out, so the SET is queued
// ahead of any query on it.
const utcMysql2 = {
  ...mysql2,
  createPool: (config: mysql2.PoolOptions) => {
    const pool = mysql2.createPool(config);
    pool.on("connection", (conn) => {
      conn.query("SET time_zone = '+00:00'");
    });
    return pool;
  },
};

export const AppDataSource = new DataSource({
  type: "mysql",
  driver: utcMysql2,
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  charset: "utf8mb4_unicode_ci",
  // Store and read datetimes as UTC so token/session expiry comparisons are correct.
  timezone: "Z",
  entities,
  // The schema (including triggers, generated columns and CHECK constraints)
  // is owned by schema.mysql.sql. Never let TypeORM alter it.
  synchronize: false,
  logging: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

export const connectDB = async (): Promise<void> => {
  await AppDataSource.initialize();
  console.log(`Connected to MySQL database "${env.DB_NAME}"`);
};
