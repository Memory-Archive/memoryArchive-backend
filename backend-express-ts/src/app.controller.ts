import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";
import { connectDB } from "./DB/DBconnection";
import { globalErrorHandler, notFoundHandler } from "./middleware/error.middleware";

import authRouter from "./modules/auth/auth.controller";
import userRouter from "./modules/users/user.controller";
import placeRouter from "./modules/places/place.controller";
import savedPlaceRouter from "./modules/savedPlaces/savedPlace.controller";
import memoryRouter from "./modules/memories/memory.controller";
import mediaRouter from "./modules/media/media.controller";
import tagRouter from "./modules/tags/tag.controller";
import collectionRouter from "./modules/collections/collection.controller";
import invitationRouter from "./modules/invitations/invitation.controller";
import reminderRouter from "./modules/reminders/reminder.controller";
import notificationRouter from "./modules/notifications/notification.controller";
import activityLogRouter from "./modules/activityLogs/activityLog.controller";
import recommendationRouter from "./modules/recommendations/recommendation.controller";
import mediaComparisonRouter from "./modules/mediaComparisons/mediaComparison.controller";
import friendRouter from "./modules/friends/friend.controller";

export const createApp = (): Express => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.use("/places", placeRouter);
  app.use("/saved-places", savedPlaceRouter);
  app.use("/memories", memoryRouter); // also /memories/:memoryId/{media,comments,reactions}
  app.use("/media", mediaRouter);
  app.use("/tags", tagRouter);
  app.use("/collections", collectionRouter); // also /collections/:collectionId/invitations
  app.use("/invitations", invitationRouter);
  app.use("/reminders", reminderRouter);
  app.use("/notifications", notificationRouter);
  app.use("/activity-logs", activityLogRouter);
  app.use("/recommendations", recommendationRouter);
  app.use("/media-comparisons", mediaComparisonRouter);
  app.use("/friends", friendRouter);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};

const bootstrap = async (): Promise<void> => {
  await connectDB();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
};

export default bootstrap;
