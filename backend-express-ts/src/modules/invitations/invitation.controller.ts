import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import invitationService from "./invitation.service";
import * as validators from "./invitation.validation";

/** Mounted at /collections/:collectionId/invitations (authentication applied by the parent router). */
export const collectionInvitationRouter = Router({ mergeParams: true });
collectionInvitationRouter.get(
  "/",
  validation(validators.listCollectionInvitations),
  invitationService.listForCollection,
);
collectionInvitationRouter.post("/", validation(validators.createInvitation), invitationService.create);
collectionInvitationRouter.delete("/:invitationId", validation(validators.revokeInvitation), invitationService.revoke);

/** Mounted at /invitations */
const router = Router();
router.use(authentication());

router.get("/", invitationService.listMine);
router.post("/accept", validation(validators.acceptInvitation), invitationService.accept);
router.post("/:invitationId/decline", validation(validators.invitationIdParam), invitationService.decline);

export default router;
