import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

/** Shared, user-independent place record (deduplicated by provider + provider_place_id). */
@Entity({ name: "places" })
@Index("places_provider_key", ["provider", "providerPlaceId"], { unique: true })
export class Place {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  address!: string | null;

  @Column({ type: "double" })
  latitude!: number;

  @Column({ type: "double" })
  longitude!: number;

  /** e.g. "google", "mapbox", "foursquare" */
  @Column({ type: "varchar", length: 30, nullable: true })
  provider!: string | null;

  @Column({ name: "provider_place_id", type: "varchar", length: 255, nullable: true })
  providerPlaceId!: string | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;
}
