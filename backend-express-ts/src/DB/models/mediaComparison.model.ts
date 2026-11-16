import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { User } from "./user.model";
import { MediaAsset } from "./mediaAsset.model";

/** A saved "then vs now" side-by-side of two different media assets. */
@Entity({ name: "media_comparisons" })
export class MediaComparison {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "char", length: 36 })
  userId!: string;

  @Column({ name: "left_media_asset_id", type: "char", length: 36 })
  leftMediaAssetId!: string;

  @Column({ name: "right_media_asset_id", type: "char", length: 36 })
  rightMediaAssetId!: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  label!: string | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;

  @ManyToOne(() => MediaAsset, { onDelete: "CASCADE" })
  @JoinColumn({ name: "left_media_asset_id" })
  leftMediaAsset!: Relation<MediaAsset>;

  @ManyToOne(() => MediaAsset, { onDelete: "CASCADE" })
  @JoinColumn({ name: "right_media_asset_id" })
  rightMediaAsset!: Relation<MediaAsset>;
}
