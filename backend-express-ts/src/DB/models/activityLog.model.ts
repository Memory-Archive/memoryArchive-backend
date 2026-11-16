import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { User } from "./user.model";
import { Memory } from "./memory.model";
import { Collection } from "./collection.model";

@Entity({ name: "activity_logs" })
export class ActivityLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "char", length: 36, nullable: true })
  userId!: string | null;

  /** e.g. "memory.created", "collection.memory_added" */
  @Column({ name: "action_type", type: "varchar", length: 80 })
  actionType!: string;

  @Column({ name: "memory_id", type: "char", length: 36, nullable: true })
  memoryId!: string | null;

  @Column({ name: "collection_id", type: "char", length: 36, nullable: true })
  collectionId!: string | null;

  /** Defaults to {} via DB trigger when omitted. */
  @Column({ type: "json", nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User> | null;

  @ManyToOne(() => Memory, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "memory_id" })
  memory!: Relation<Memory> | null;

  @ManyToOne(() => Collection, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "collection_id" })
  collection!: Relation<Collection> | null;
}
