import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { User } from "./user.model";

/** One row per refresh token. Revoke by setting `revokedAt` (e.g. on logout). */
@Entity({ name: "auth_sessions" })
export class AuthSession {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "char", length: 36 })
  userId!: string;

  @Column({ name: "refresh_token_hash", type: "varchar", length: 255, unique: true, select: false })
  refreshTokenHash!: string;

  @Column({ name: "device_name", type: "varchar", length: 120, nullable: true })
  deviceName!: string | null;

  @Column({ name: "ip_address", type: "varchar", length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ name: "user_agent", type: "varchar", length: 512, nullable: true })
  userAgent!: string | null;

  @Column({ name: "expires_at", type: "datetime" })
  expiresAt!: Date;

  @Column({ name: "revoked_at", type: "datetime", nullable: true })
  revokedAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;
}
