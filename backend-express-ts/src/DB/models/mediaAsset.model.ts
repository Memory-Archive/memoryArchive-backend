import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import type { MediaType, ProcessingStatus } from "../../common/enums";
import { numericTransformer } from "../transformers";
import { Memory } from "./memory.model";
import { User } from "./user.model";

@Entity({ name: "media_assets" })
export class MediaAsset {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "memory_id", type: "char", length: 36 })
  memoryId!: string;

  @Column({ name: "user_id", type: "char", length: 36 })
  userId!: string;

  /** Key/path in object storage (S3, R2, local disk, ...). */
  @Column({ name: "storage_key", type: "varchar", length: 255, unique: true })
  storageKey!: string;

  @Column({ name: "original_filename", type: "varchar", length: 255, nullable: true })
  originalFilename!: string | null;

  @Column({ name: "media_type", type: "varchar", length: 20 })
  mediaType!: MediaType;

  @Column({ name: "mime_type", type: "varchar", length: 100 })
  mimeType!: string;

  @Column({ name: "file_size_bytes", type: "bigint", transformer: numericTransformer })
  fileSizeBytes!: number;

  @Column({ name: "width_px", type: "int", nullable: true })
  widthPx!: number | null;

  @Column({ name: "height_px", type: "int", nullable: true })
  heightPx!: number | null;

  @Column({
    name: "duration_seconds",
    type: "decimal",
    precision: 8,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  durationSeconds!: number | null;

  @Column({ name: "checksum_sha256", type: "char", length: 64, nullable: true })
  checksumSha256!: string | null;

  @Column({ name: "processing_status", type: "varchar", length: 20, default: "ready" })
  processingStatus!: ProcessingStatus;

  @Column({ type: "varchar", length: 500, nullable: true })
  caption!: string | null;

  @Column({ name: "sort_order", type: "int", default: 0 })
  sortOrder!: number;

  /** Only one live (non-deleted) cover per memory is allowed (enforced by the `live_cover` unique index). */
  @Column({ name: "is_cover", type: "boolean", default: false })
  isCover!: boolean;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "datetime", nullable: true })
  deletedAt!: Date | null;

  /** STORED generated column computed by MySQL; never written by the app. */
  @Column({
    name: "live_cover",
    type: "tinyint",
    nullable: true,
    select: false,
    generatedType: "STORED",
    asExpression: "IF(is_cover = 1 AND deleted_at IS NULL, 1, NULL)",
  })
  liveCover!: number | null;

  @ManyToOne(() => Memory, (memory) => memory.mediaAssets, { onDelete: "CASCADE" })
  @JoinColumn({ name: "memory_id" })
  memory!: Relation<Memory>;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;
}
