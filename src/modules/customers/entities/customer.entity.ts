import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("customers")
export class CustomerEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index("ux_customers_phone", { unique: true })
  @Column({ type: "varchar", length: 15, name: "phone" })
  phone!: string;

  @Column({ type: "varchar", length: 150, name: "name" })
  name!: string;

  //   @OneToMany(() => OrderEntity, (order) => order.customer)
  //   orders!: OrderEntity[];

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at", nullable: true })
  updatedAt!: Date;

  @DeleteDateColumn({ type: "timestamptz", name: "deleted_at", nullable: true })
  deletedAt!: Date;
}
