import "reflect-metadata";
import bootstrap from "./app.controller";

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
