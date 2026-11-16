import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { Memory, Reminder, SavedPlace } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

/**
 * Delivery: a scheduled job (node-cron / BullMQ) should poll
 * `status = 'pending' AND remind_at <= NOW()` (reminders_due_idx),
 * create a notification, then set status = 'sent', sentAt = now.
 */
class ReminderService {
  private readonly reminderModel = new DBService(Reminder);
  private readonly memoryModel = new DBService(Memory);
  private readonly savedPlaceModel = new DBService(SavedPlace);

  // GET /reminders
  list = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /reminders  - memoryId / savedPlaceId (if given) must belong to the user.
  create = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // GET /reminders/:reminderId
  getById = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PATCH /reminders/:reminderId  - only while status is "pending".
  update = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /reminders/:reminderId
  remove = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new ReminderService();
