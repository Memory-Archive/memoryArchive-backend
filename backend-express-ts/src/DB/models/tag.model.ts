import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import { User } from "./user.model";
import { Memory } from "./memory.model";

@Entity({ name: "tags" })
@Index("tags_user_name_key", ["userId", "name"], { unique: true })
export class Tag {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "char", length: 36 })
  userId!: string;

  @Column({ type: "varchar", length: 50 })
  name!: string;

  /** Hex colour, e.g. "#FF8800" */
  @Column({ type: "char", length: 7, nullable: true })
  color!: string | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.tags, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;

  @ManyToMany(() => Memory, (memory) => memory.tags)
  memories!: Relation<Memory[]>;
}
