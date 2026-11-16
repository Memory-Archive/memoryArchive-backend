import { z } from "zod";
import { REMINDER_STATUSES } from "../../common/enums";
import { generalFields, idParams, paginationQuery } from "../../common/validation";

export const listReminders = {
  query: paginationQuery.extend({
    status: z.enum(REMINDER_STATUSES).optional(),
  }),
};

export const createReminder = {
  body: z.object({
    title: z.string().trim().min(1).max(200),
    message: z.string().trim().max(1000).nullish(),
    remindAt: generalFields.datetime.refine((d) => d.getTime() > Date.now(), "remindAt must be in the future"),
    memoryId: generalFields.id.nullish(),
    savedPlaceId: generalFields.id.nullish(),
  }),
};

export const updateReminder = {
  params: idParams("reminderId"),
  body: z
    .object({
      title: z.string().trim().min(1).max(200),
      message: z.string().trim().max(1000).nullable(),
      remindAt: generalFields.datetime,
      /** Clients may only cancel; "sent" is set by the reminder job. */
      status: z.literal("cancelled"),
    })
    .partial()
    .refine((b) => Object.keys(b).length > 0, "Provide at least one field to update"),
};

export const reminderIdParam = { params: idParams("reminderId") };

export type ListRemindersQuery = z.infer<typeof listReminders.query>;
export type CreateReminderDTO = z.infer<typeof createReminder.body>;
export type UpdateReminderDTO = z.infer<typeof updateReminder.body>;
