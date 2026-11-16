import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import type { CollectionRole, InvitationStatus } from "../../common/enums";
import { Collection } from "./collection.model";
import { User } from "./user.model";

/** At least one of `inviteeUserId` / `inviteeEmail` must be set (DB CHECK constraint). */
@Entity({ name: "collection_invitations" })
export class CollectionInvitation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "collection_id", type: "char", length: 36 })
  collectionId!: string;

  @Column({ name: "invited_by_user_id", type: "char", length: 36 })
  invitedByUserId!: string;

  @Column({ name: "invitee_user_id", type: "char", length: 36, nullable: true })
  inviteeUserId!: string | null;

  @Column({ name: "invitee_email", type: "varchar", length: 254, nullable: true })
  inviteeEmail!: string | null;

  @Column({ type: "varchar", length: 20 })
  role!: CollectionRole;

  @Column({ name: "token_hash", type: "varchar", length: 255, unique: true, select: false })
  tokenHash!: string;

  @Column({ type: "varchar", length: 20, default: "pending" })
  status!: InvitationStatus;

  @Column({ name: "expires_at", type: "datetime" })
  expiresAt!: Date;

  @Column({ name: "responded_at", type: "datetime", nullable: true })
  respondedAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  /** STORED generated column: one pending invite per email per collection. Never written by the app. */
  @Column({
    name: "pending_invitee_email",
    type: "varchar",
    length: 254,
    nullable: true,
    select: false,
    generatedType: "STORED",
    asExpression: "IF(status = 'pending', invitee_email, NULL)",
  })
  pendingInviteeEmail!: string | null;

  @ManyToOne(() => Collection, (collection) => collection.invitations, { onDelete: "CASCADE" })
  @JoinColumn({ name: "collection_id" })
  collection!: Relation<Collection>;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "invited_by_user_id" })
  invitedBy!: Relation<User>;

  @ManyToOne(() => User, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "invitee_user_id" })
  invitee!: Relation<User> | null;
}
