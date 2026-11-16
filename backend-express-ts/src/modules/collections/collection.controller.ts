import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import { collectionInvitationRouter } from "../invitations/invitation.controller";
import collectionService from "./collection.service";
import * as validators from "./collection.validation";

const router = Router();
router.use(authentication());

router.get("/", validation(validators.listCollections), collectionService.list);
router.post("/", validation(validators.createCollection), collectionService.create);
router.get("/:collectionId", validation(validators.collectionIdParam), collectionService.getById);
router.patch("/:collectionId", validation(validators.updateCollection), collectionService.update);
router.delete("/:collectionId", validation(validators.collectionIdParam), collectionService.remove);

// Memories in a collection
router.get("/:collectionId/memories", validation(validators.listCollectionMemories), collectionService.listMemories);
router.post("/:collectionId/memories", validation(validators.addCollectionMemory), collectionService.addMemory);
router.delete(
  "/:collectionId/memories/:memoryId",
  validation(validators.collectionMemoryParams),
  collectionService.removeMemory,
);

// Members
router.get("/:collectionId/members", validation(validators.collectionIdParam), collectionService.listMembers);
router.patch(
  "/:collectionId/members/:userId",
  validation(validators.updateMemberRole),
  collectionService.updateMemberRole,
);
router.delete("/:collectionId/members/:userId", validation(validators.memberParams), collectionService.removeMember);

// Invitations sent for this collection
router.use("/:collectionId/invitations", collectionInvitationRouter);

export default router;
