import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { Notification } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

const notificationModel = new DBService(Notification);

/**
 * Create a notification from any other service, e.g.
 *   await notify(memory.userId, "comment.created", { memoryId, commentId, byUserId });
 */
export const notify = (userId: string, notificationType: string, payload: Record<string, unknown> = {}) => {
  return notificationModel.create({ userId, notificationType, payload });
};

class NotificationService {
  private readonly notificationModel = notificationModel;

  // GET /notifications?unreadOnly=  - newest first (notifications_user_idx).
  list = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // GET /notifications/unread-count
  unreadCount = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PATCH /notifications/read-all  - set readAt = now where readAt IS NULL.
  markAllRead = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PATCH /notifications/:notificationId/read
  markRead = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /notifications/:notificationId
  remove = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new NotificationService();
