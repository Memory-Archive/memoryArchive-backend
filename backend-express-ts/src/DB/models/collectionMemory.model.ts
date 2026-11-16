import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from "typeorm";
import { Collection } from "./collection.model";
import { Memory } from "./memory.model";
import { User } from "./user.model";

@Entity({ name: "collection_memories" })
export class CollectionMemory {
  @PrimaryColumn({ name: "collection_id", type: "char", length: 36 })
  collectionId!: string;

  @PrimaryColumn({ name: "memory_id", type: "char", length: 36 })
  memoryId!: string;

  @Column({ name: "added_by", type: "char", length: 36, nullable: true })
  addedBy!: string | null;

  @CreateDateColumn({ name: "added_at", type: "datetime" })
  addedAt!: Date;

  @ManyToOne(() => Collection, (collection) => collection.collectionMemories, { onDelete: "CASCADE" })
  @JoinColumn({ name: "collection_id" })
  collection!: Relation<Collection>;

  @ManyToOne(() => Memory, (memory) => memory.collectionMemories, { onDelete: "CASCADE" })
  @JoinColumn({ name: "memory_id" })
  memory!: Relation<Memory>;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "added_by" })
  addedByUser!: Relation<User> | null;
}
