import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "../config/env";
import { entities } from "./models";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  charset: "utf8mb4_unicode_ci",
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
