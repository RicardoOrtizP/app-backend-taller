import { DataSource } from "typeorm";

// Data source de base de datos
export function createDataSource(url: string): DataSource {
  return new DataSource({
    type: "postgres",
    url: url,
    synchronize: true,
    uuidExtension: "pgcrypto",
    logging: false,
    entities: [],
    migrations: [],
    migrationsRun: false,
  });
}

export const AppDataSource = createDataSource(
  process.env.DATABASE_URL ??
    "postgres://developer:developer@localhost:5432/taller_imprenta",
);
