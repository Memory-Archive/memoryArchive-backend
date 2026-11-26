import { z } from "zod";
import { SAVED_PLACE_STATUSES } from "../../common/enums";
import { generalFields, idParams, paginationQuery } from "../../common/validation";

export const listSavedPlaces = {
  query: paginationQuery.extend({
    status: z.enum(SAVED_PLACE_STATUSES).optional(),
    favourite: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
  }),
};

export const createSavedPlace = {
  body: z.object({
    placeId: generalFields.id,
    notes: z.string().trim().max(2000).nullish(),
    targetDate: generalFields.date.nullish(),
    status: z.enum(SAVED_PLACE_STATUSES).default("planned"),
    isFavourite: z.boolean().default(false),
  }),
};

export const updateSavedPlace = {
  params: idParams("savedPlaceId"),
  body: z
    .object({
      notes: z.string().trim().max(2000).nullable(),
      targetDate: generalFields.date.nullable(),
      status: z.enum(SAVED_PLACE_STATUSES),
      isFavourite: z.boolean(),
    })
    .partial()
    .refine((b) => Object.keys(b).length > 0, "Provide at least one field to update"),
};

export const savedPlaceIdParam = { params: idParams("savedPlaceId") };

export type ListSavedPlacesQuery = z.infer<typeof listSavedPlaces.query>;
export type CreateSavedPlaceDTO = z.infer<typeof createSavedPlace.body>;
export type UpdateSavedPlaceDTO = z.infer<typeof updateSavedPlace.body>;
