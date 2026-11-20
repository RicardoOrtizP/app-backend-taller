import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "../../users/entities/user.entity";

@Entity("refresh-tokens")
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 64, unique: true, name: "token_hash" })
  tokenHash!: string;

  @Column({ type: "uuid", name: "user_id" })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.refreshTokens, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @Column({ type: "timestamptz", name: "expires_at" })
  expiresAt!: Date;

  @Column({ type: "timestamptz", nullable: true, name: "revoked_at" })
  revokedAt!: Date | null;

  // Hash del token que reemplazó a este (cadena de rotación)
  @Column({
    type: "varchar",
    length: 64,
    nullable: true,
    name: "replaced_by_token_hash",
  })
  replacedByTokenHash!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true, name: "user_agent" })
  userAgent!: string | null;

  @Column({ type: "varchar", length: 45, nullable: true })
  ip!: string | null;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date;
}
