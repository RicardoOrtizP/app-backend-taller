import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import { DataSource } from "typeorm";
import { UserEntity } from "../modules/users/entities/user.entity";
import { RefreshTokenEntity } from "../modules/auth/entities/refresh-token.entity";
import { CustomerEntity } from "../modules/customers/entities/customer.entity";

// Data source de base de datos
export function createDataSource(url: string): DataSource {
  return new DataSource({
    type: "postgres",
    url: url,
    synchronize: true,
    uuidExtension: "pgcrypto",
    logging: false,
    entities: [UserEntity, RefreshTokenEntity, CustomerEntity],
    migrations: [],
    migrationsRun: false,
  });
}

export const AppDataSource = createDataSource(
  process.env.DATABASE_URL ??
    "postgres://developer:developer@localhost:5432/taller_imprenta",
);
