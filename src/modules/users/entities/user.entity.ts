import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { Role } from "../../auth/types/auth.types";
import { RefreshTokenEntity } from "../../auth/entities/refresh-token.entity";

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({
    type: "varchar",
    length: 255,
    select: false,
    name: "password_hash",
  })
  passwordHash!: string;

  @Column({ type: "varchar", length: 20, default: "USER" })
  role!: Role;

  @Column({ type: "boolean", default: true, name: "is_active" })
  isActive!: boolean;

  // Recuperación de contraseña se guarda solo el hash sha-256 del token que se envia por email
  @Column({
    type: "varchar",
    length: 64,
    nullable: true,
    select: false,
    name: "password_reset_token_hash",
  })
  passwordResetTokenHash!: string | null;

  @Column({
    type: "timestamptz",
    nullable: true,
    name: "password_reset_expires_at",
  })
  passwordResetExpiresAt!: Date | null;

  @OneToMany(() => RefreshTokenEntity, (token) => token.user)
  refreshTokens!: RefreshTokenEntity[];

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt!: Date;

  @DeleteDateColumn({ type: "timestamptz", name: "deleted_at", nullable: true })
  deletedAt!: Date;
}
