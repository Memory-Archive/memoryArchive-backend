import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from "typeorm";
import type { SavedPlaceStatus } from "../../common/enums";
import { User } from "./user.model";
import { Place } from "./place.model";

/** A user's "want to go" / "been there" bookmark for a place. */
@Entity({ name: "saved_places" })
@Index("saved_places_user_place_key", ["userId", "placeId"], { unique: true })
export class SavedPlace {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "char", length: 36 })
  userId!: string;

  @Column({ name: "place_id", type: "char", length: 36 })
  placeId!: string;

  @Column({ type: "varchar", length: 2000, nullable: true })
  notes!: string | null;

  /** "YYYY-MM-DD" */
  @Column({ name: "target_date", type: "date", nullable: true })
  targetDate!: string | null;

  @Column({ type: "varchar", length: 20, default: "planned" })
  status!: SavedPlaceStatus;

  @Column({ name: "is_favourite", type: "boolean", default: false })
  isFavourite!: boolean;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;

  @ManyToOne(() => Place, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "place_id" })
  place!: Relation<Place>;
}
