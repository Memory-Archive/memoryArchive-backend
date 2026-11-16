import { z } from "zod";
import { idParams, paginationQuery } from "../../common/validation";

export const listNotifications = {
  query: paginationQuery.extend({
    unreadOnly: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .default(false),
  }),
};

export const notificationIdParam = { params: idParams("notificationId") };

export type ListNotificationsQuery = z.infer<typeof listNotifications.query>;
