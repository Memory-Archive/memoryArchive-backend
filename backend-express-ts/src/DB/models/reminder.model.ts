import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import type { ReminderStatus } from "../../common/enums";
import { User } from "./user.model";
import { Memory } from "./memory.model";
import { SavedPlace } from "./savedPlace.model";

@Entity({ name: "reminders" })
export class Reminder {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "char", length: 36 })
  userId!: string;

  @Column({ name: "memory_id", type: "char", length: 36, nullable: true })
  memoryId!: string | null;

  @Column({ name: "saved_place_id", type: "char", length: 36, nullable: true })
  savedPlaceId!: string | null;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "varchar", length: 1000, nullable: true })
  message!: string | null;

  @Column({ name: "remind_at", type: "datetime" })
  remindAt!: Date;

  @Column({ type: "varchar", length: 20, default: "pending" })
  status!: ReminderStatus;

  @Column({ name: "sent_at", type: "datetime", nullable: true })
  sentAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;

  @ManyToOne(() => Memory, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "memory_id" })
  memory!: Relation<Memory> | null;

  @ManyToOne(() => SavedPlace, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "saved_place_id" })
  savedPlace!: Relation<SavedPlace> | null;
}
