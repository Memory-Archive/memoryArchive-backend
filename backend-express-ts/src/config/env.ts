import "dotenv/config";

const required = (key: string): string => {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),
  DB_HOST: required("DB_HOST"),
  DB_PORT: Number(process.env.DB_PORT ?? 3306),
  DB_USERNAME: required("DB_USERNAME"),
  DB_PASSWORD: process.env.DB_PASSWORD ?? "",
  DB_NAME: required("DB_NAME"),

  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  // Refresh tokens are opaque random strings (hashed in auth_sessions), so no signing secret is needed.
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",

  CORS_ORIGIN: required("CORS_ORIGIN"),
} as const;

if (env.JWT_ACCESS_SECRET.length < 32) {
  throw new Error("JWT_ACCESS_SECRET must be at least 32 characters");
}
