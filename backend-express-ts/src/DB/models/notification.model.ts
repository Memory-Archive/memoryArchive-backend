import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { User } from "./user.model";

@Entity({ name: "notifications" })
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "char", length: 36 })
  userId!: string;

  /** e.g. "comment.created", "collection.invited", "reminder.due" */
  @Column({ name: "notification_type", type: "varchar", length: 50 })
  notificationType!: string;

  /** Defaults to {} via DB trigger when omitted. */
  @Column({ type: "json", nullable: true })
  payload!: Record<string, unknown> | null;

  @Column({ name: "read_at", type: "datetime", nullable: true })
  readAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;
}
