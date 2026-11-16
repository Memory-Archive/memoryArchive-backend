import { z } from "zod";
import { COLLECTION_ROLES } from "../../common/enums";
import { generalFields, idParams } from "../../common/validation";

export const listCollectionInvitations = { params: idParams("collectionId") };

export const createInvitation = {
  params: idParams("collectionId"),
  body: z
    .object({
      inviteeUserId: generalFields.id.optional(),
      inviteeEmail: generalFields.email.optional(),
      role: z.enum(COLLECTION_ROLES).default("viewer"),
    })
    .refine((b) => !!b.inviteeUserId || !!b.inviteeEmail, "Provide inviteeUserId or inviteeEmail"),
};

export const revokeInvitation = { params: idParams("collectionId", "invitationId") };

export const acceptInvitation = {
  body: z.object({ token: z.string().min(1) }),
};

export const invitationIdParam = { params: idParams("invitationId") };

export type CreateInvitationDTO = z.infer<typeof createInvitation.body>;
export type AcceptInvitationDTO = z.infer<typeof acceptInvitation.body>;
