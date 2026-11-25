import { z } from "zod";
import { generalFields, idParams, paginationQuery } from "../../common/validation";

export const listFriends = {
  query: paginationQuery,
};

export const listFriendRequests = {
  query: paginationQuery.extend({
    direction: z.enum(["incoming", "outgoing"]).default("incoming"),
  }),
};

export const sendFriendRequest = {
  body: z.object({
    userId: generalFields.id,
  }),
};

export const friendshipIdParam = { params: idParams("friendshipId") };

export const friendUserIdParam = { params: idParams("userId") };

export type ListFriendsQuery = z.infer<typeof listFriends.query>;
export type ListFriendRequestsQuery = z.infer<typeof listFriendRequests.query>;
export type SendFriendRequestDTO = z.infer<typeof sendFriendRequest.body>;
