import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from "typeorm";
import type { ReactionType } from "../../common/enums";
import { Memory } from "./memory.model";
import { User } from "./user.model";

/** One reaction per user per memory (composite PK). */
@Entity({ name: "reactions" })
export class Reaction {
  @PrimaryColumn({ name: "memory_id", type: "char", length: 36 })
  memoryId!: string;

  @PrimaryColumn({ name: "user_id", type: "char", length: 36 })
  userId!: string;

  @Column({ name: "reaction_type", type: "varchar", length: 20 })
  reactionType!: ReactionType;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @ManyToOne(() => Memory, (memory) => memory.reactions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "memory_id" })
  memory!: Relation<Memory>;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;
}
