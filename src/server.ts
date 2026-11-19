import { createApp } from "./app";
import { AppDataSource } from "./config/data-source";

async function bootstrap() {
  // Inicializar la conexión a la base de datos
  await AppDataSource.initialize();
  // Puerto en el que corre la aplicación
  const PORT = Number(process.env.PORT ?? "3000");
  const server = createApp().listen(PORT, () => {
    console.log(`App taller corriendo en http://localhost:${PORT}`);
  });

  async function shutdown() {
    server.close(async () => {
      process.exit(0);
    });
  }

  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());
}

bootstrap().catch((error) => {
  console.error("Error al iniciar servidor.", error);
  process.exit(1);
});
