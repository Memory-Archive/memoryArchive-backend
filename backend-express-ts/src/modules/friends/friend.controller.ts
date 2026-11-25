import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import friendService from "./friend.service";
import * as validators from "./friend.validation";

const router = Router();
router.use(authentication());

router.get("/", validation(validators.listFriends), friendService.listFriends);

router.get("/requests", validation(validators.listFriendRequests), friendService.listRequests);
router.post("/requests", validation(validators.sendFriendRequest), friendService.sendRequest);
router.post("/requests/:friendshipId/accept", validation(validators.friendshipIdParam), friendService.acceptRequest);
router.delete("/requests/:friendshipId", validation(validators.friendshipIdParam), friendService.removeRequest);

router.delete("/:userId", validation(validators.friendUserIdParam), friendService.unfriend);

export default router;
