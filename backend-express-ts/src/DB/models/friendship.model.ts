import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import type { FriendshipStatus } from "../../common/enums";
import { User } from "./user.model";

/**
 * One row per pair of users: a pending friend request or an accepted friendship.
 *
 * - requester_id sent the request, addressee_id received it.
 * - status: 'pending' -> 'accepted'. Decline / cancel / unfriend DELETE the row,
 *   so the two users can send a new request later.
 * - A pair exists at most once in EITHER direction: UNIQUE (requester_id, addressee_id)
 *   blocks A->B twice, and the friendships_not_self_ins trigger blocks B->A when A->B
 *   exists. Both raise ER_DUP_ENTRY (1062) -> 409. (Trigger, not an expression index,
 *   so it works on MySQL 5.7.) The trigger can miss two reverse requests sent in the
 *   same instant, so the service should also check inside a transaction.
 * - You can't friend yourself (friendships_not_self_* triggers, error 3819).
 *
 * "Friends of X" = rows with status 'accepted' AND (requester_id = X OR addressee_id = X).
 *
 * API: src/modules/friends (friend.service.ts describes each endpoint).
 */
@Entity({ name: "friendships" })
export class Friendship {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "requester_id", type: "char", length: 36 })
  requesterId!: string;

  @Column({ name: "addressee_id", type: "char", length: 36 })
  addresseeId!: string;

  @Column({ type: "varchar", length: 20, default: "pending" })
  status!: FriendshipStatus;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @Column({ name: "responded_at", type: "datetime", nullable: true })
  respondedAt!: Date | null;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "requester_id" })
  requester!: Relation<User>;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "addressee_id" })
  addressee!: Relation<User>;
}
