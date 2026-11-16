import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from "typeorm";
import type { UserStatus } from "../../common/enums";
import { AuthSession } from "./authSession.model";
import { Memory } from "./memory.model";
import { Tag } from "./tag.model";
import { Collection } from "./collection.model";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 30, unique: true })
  username!: string;

  @Column({ type: "varchar", length: 254, unique: true })
  email!: string;

  /** Excluded from queries by default; use `select` / `addSelect` when verifying passwords. */
  @Column({ name: "password_hash", type: "varchar", length: 255, select: false })
  passwordHash!: string;

  @Column({ name: "display_name", type: "varchar", length: 80, nullable: true })
  displayName!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  bio!: string | null;

  @Column({ type: "varchar", length: 20, default: "active" })
  status!: UserStatus;

  @Column({ name: "email_verified_at", type: "datetime", nullable: true })
  emailVerifiedAt!: Date | null;

  @Column({ name: "last_login_at", type: "datetime", nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "datetime", nullable: true })
  deletedAt!: Date | null;

  @OneToMany(() => AuthSession, (session) => session.user)
  sessions!: Relation<AuthSession[]>;

  @OneToMany(() => Memory, (memory) => memory.user)
  memories!: Relation<Memory[]>;

  @OneToMany(() => Tag, (tag) => tag.user)
  tags!: Relation<Tag[]>;

  @OneToMany(() => Collection, (collection) => collection.user)
  collections!: Relation<Collection[]>;
}
