import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from "typeorm";
import { Memory } from "./memory.model";
import { User } from "./user.model";

@Entity({ name: "comments" })
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "memory_id", type: "char", length: 36 })
  memoryId!: string;

  @Column({ name: "user_id", type: "char", length: 36 })
  userId!: string;

  @Column({ type: "varchar", length: 2000 })
  body!: string;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "datetime", nullable: true })
  deletedAt!: Date | null;

  @ManyToOne(() => Memory, (memory) => memory.comments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "memory_id" })
  memory!: Relation<Memory>;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;
}
