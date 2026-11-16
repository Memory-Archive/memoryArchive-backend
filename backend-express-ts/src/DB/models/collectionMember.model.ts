import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from "typeorm";
import type { CollectionRole } from "../../common/enums";
import { Collection } from "./collection.model";
import { User } from "./user.model";

/** Non-owner members of a collection. The owner is `collections.user_id`. */
@Entity({ name: "collection_members" })
export class CollectionMember {
  @PrimaryColumn({ name: "collection_id", type: "char", length: 36 })
  collectionId!: string;

  @PrimaryColumn({ name: "user_id", type: "char", length: 36 })
  userId!: string;

  @Column({ type: "varchar", length: 20 })
  role!: CollectionRole;

  @CreateDateColumn({ name: "joined_at", type: "datetime" })
  joinedAt!: Date;

  @ManyToOne(() => Collection, (collection) => collection.members, { onDelete: "CASCADE" })
  @JoinColumn({ name: "collection_id" })
  collection!: Relation<Collection>;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;
}
