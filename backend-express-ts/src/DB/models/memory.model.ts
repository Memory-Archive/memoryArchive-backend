import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from "typeorm";
import type { MemoryVisibility } from "../../common/enums";
import { User } from "./user.model";
import { Place } from "./place.model";
import { MediaAsset } from "./mediaAsset.model";
import { Tag } from "./tag.model";
import { Comment } from "./comment.model";
import { Reaction } from "./reaction.model";
import { CollectionMemory } from "./collectionMemory.model";

@Entity({ name: "memories" })
export class Memory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "char", length: 36 })
  userId!: string;

  @Column({ name: "place_id", type: "char", length: 36, nullable: true })
  placeId!: string | null;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  /** "YYYY-MM-DD" */
  @Column({ name: "memory_date", type: "date" })
  memoryDate!: string;

  /** "HH:MM:SS" */
  @Column({ name: "memory_time", type: "time", nullable: true })
  memoryTime!: string | null;

  /** IANA zone, e.g. "Africa/Cairo" */
  @Column({ type: "varchar", length: 64, nullable: true })
  timezone!: string | null;

  @Column({ name: "spotify_track_uri", type: "varchar", length: 255, nullable: true })
  spotifyTrackUri!: string | null;

  @Column({ name: "spotify_track_name", type: "varchar", length: 255, nullable: true })
  spotifyTrackName!: string | null;

  /** Owner-only star. Only the memory's owner can favourite it. */
  @Column({ name: "is_favourite", type: "boolean", default: false })
  isFavourite!: boolean;

  /** 'private' = owner only, 'friends' = owner + friends. There is no public option. */
  @Column({ type: "varchar", length: 20, default: "private" })
  visibility!: MemoryVisibility;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "datetime", nullable: true })
  deletedAt!: Date | null;

  @ManyToOne(() => User, (user) => user.memories, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;

  @ManyToOne(() => Place, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "place_id" })
  place!: Relation<Place> | null;

  @OneToMany(() => MediaAsset, (media) => media.memory)
  mediaAssets!: Relation<MediaAsset[]>;

  /** Backed by the `memory_tags` join table (no separate entity needed). */
  @ManyToMany(() => Tag, (tag) => tag.memories)
  @JoinTable({
    name: "memory_tags",
    joinColumn: { name: "memory_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" },
  })
  tags!: Relation<Tag[]>;

  @OneToMany(() => Comment, (comment) => comment.memory)
  comments!: Relation<Comment[]>;

  @OneToMany(() => Reaction, (reaction) => reaction.memory)
  reactions!: Relation<Reaction[]>;

  @OneToMany(() => CollectionMemory, (cm) => cm.memory)
  collectionMemories!: Relation<CollectionMemory[]>;
}
