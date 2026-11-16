import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from "typeorm";
import { User } from "./user.model";
import { MediaAsset } from "./mediaAsset.model";
import { CollectionMemory } from "./collectionMemory.model";
import { CollectionMember } from "./collectionMember.model";
import { CollectionInvitation } from "./collectionInvitation.model";

@Entity({ name: "collections" })
export class Collection {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /** Owner of the collection. */
  @Column({ name: "user_id", type: "char", length: 36 })
  userId!: string;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ type: "varchar", length: 2000, nullable: true })
  description!: string | null;

  @Column({ name: "cover_media_id", type: "char", length: 36, nullable: true })
  coverMediaId!: string | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "datetime", nullable: true })
  deletedAt!: Date | null;

  @ManyToOne(() => User, (user) => user.collections, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;

  @ManyToOne(() => MediaAsset, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "cover_media_id" })
  coverMedia!: Relation<MediaAsset> | null;

  @OneToMany(() => CollectionMemory, (cm) => cm.collection)
  collectionMemories!: Relation<CollectionMemory[]>;

  @OneToMany(() => CollectionMember, (member) => member.collection)
  members!: Relation<CollectionMember[]>;

  @OneToMany(() => CollectionInvitation, (invitation) => invitation.collection)
  invitations!: Relation<CollectionInvitation[]>;
}
