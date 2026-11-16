import { User } from "./user.model";
import { AuthSession } from "./authSession.model";
import { PasswordResetToken } from "./passwordResetToken.model";
import { Place } from "./place.model";
import { Memory } from "./memory.model";
import { MediaAsset } from "./mediaAsset.model";
import { Tag } from "./tag.model";
import { Collection } from "./collection.model";
import { CollectionMemory } from "./collectionMemory.model";
import { CollectionMember } from "./collectionMember.model";
import { CollectionInvitation } from "./collectionInvitation.model";
import { SavedPlace } from "./savedPlace.model";
import { Comment } from "./comment.model";
import { Reaction } from "./reaction.model";
import { Reminder } from "./reminder.model";
import { Notification } from "./notification.model";
import { ActivityLog } from "./activityLog.model";
import { RecommendationFeedback } from "./recommendationFeedback.model";
import { MediaComparison } from "./mediaComparison.model";

// `memory_tags` has no entity of its own: it is the @JoinTable behind Memory.tags.

export {
  User,
  AuthSession,
  PasswordResetToken,
  Place,
  Memory,
  MediaAsset,
  Tag,
  Collection,
  CollectionMemory,
  CollectionMember,
  CollectionInvitation,
  SavedPlace,
  Comment,
  Reaction,
  Reminder,
  Notification,
  ActivityLog,
  RecommendationFeedback,
  MediaComparison,
};

export const entities = [
  User,
  AuthSession,
  PasswordResetToken,
  Place,
  Memory,
  MediaAsset,
  Tag,
  Collection,
  CollectionMemory,
  CollectionMember,
  CollectionInvitation,
  SavedPlace,
  Comment,
  Reaction,
  Reminder,
  Notification,
  ActivityLog,
  RecommendationFeedback,
  MediaComparison,
];
