import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { User } from "./user.model";

@Entity({ name: "recommendation_feedback" })
export class RecommendationFeedback {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "char", length: 36 })
  userId!: string;

  @Column({ name: "provider_place_id", type: "varchar", length: 255 })
  providerPlaceId!: string;

  /** 1-5 */
  @Column({ type: "smallint", nullable: true })
  rating!: number | null;

  @Column({ name: "feedback_text", type: "varchar", length: 1000, nullable: true })
  feedbackText!: string | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;
}
