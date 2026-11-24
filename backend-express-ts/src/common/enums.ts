// Allowed values mirror the CHECK constraints in the MySQL schema.
// Reuse these in both models and zod validation so they never drift apart.

export const USER_STATUSES = ["active", "disabled"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const MEDIA_TYPES = ["photo", "audio"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const PROCESSING_STATUSES = ["pending", "ready", "failed"] as const;
export type ProcessingStatus = (typeof PROCESSING_STATUSES)[number];

export const COLLECTION_ROLES = ["viewer", "contributor"] as const;
export type CollectionRole = (typeof COLLECTION_ROLES)[number];

export const INVITATION_STATUSES = ["pending", "accepted", "declined", "revoked", "expired"] as const;
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export const SAVED_PLACE_STATUSES = ["planned", "visited"] as const;
export type SavedPlaceStatus = (typeof SAVED_PLACE_STATUSES)[number];

export const REACTION_TYPES = ["like", "love", "laugh", "wow", "sad"] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

export const MEMORY_VISIBILITIES = ["private", "friends"] as const;
export type MemoryVisibility = (typeof MEMORY_VISIBILITIES)[number];

export const FRIENDSHIP_STATUSES = ["pending", "accepted"] as const;
export type FriendshipStatus = (typeof FRIENDSHIP_STATUSES)[number];

export const REMINDER_STATUSES = ["pending", "sent", "cancelled"] as const;
export type ReminderStatus = (typeof REMINDER_STATUSES)[number];
