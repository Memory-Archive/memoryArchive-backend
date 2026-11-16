import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { ActivityLog, Collection, CollectionMember } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

const activityLogModel = new DBService(ActivityLog);

/**
 * Record an action from any other service, e.g.
 *   await logActivity({ userId, actionType: "memory.created", memoryId: memory.id });
 */
export const logActivity = (entry: {
  userId: string | null;
  actionType: string;
  memoryId?: string | null;
  collectionId?: string | null;
  metadata?: Record<string, unknown>;
}) => {
  return activityLogModel.create({
    userId: entry.userId,
    actionType: entry.actionType,
    memoryId: entry.memoryId ?? null,
    collectionId: entry.collectionId ?? null,
    metadata: entry.metadata ?? {},
  });
};

class ActivityLogService {
  private readonly activityLogModel = activityLogModel;
  private readonly collectionModel = new DBService(Collection);
  private readonly memberModel = new DBService(CollectionMember);

  // GET /activity-logs?collectionId=&memoryId=  - newest first.
  list = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new ActivityLogService();
