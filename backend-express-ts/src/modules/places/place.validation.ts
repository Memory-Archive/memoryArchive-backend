import { z } from "zod";
import { generalFields, idParams, paginationQuery } from "../../common/validation";

export const searchPlaces = {
  query: paginationQuery.extend({
    q: z.string().trim().min(1).max(200).optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    radiusKm: z.coerce.number().positive().max(500).default(5),
  }).refine((q) => (q.lat === undefined) === (q.lng === undefined), "lat and lng must be provided together"),
};

/** Find-or-create: if provider + providerPlaceId already exist, return the existing place. */
export const createPlace = {
  body: z
    .object({
      name: z.string().trim().min(1).max(200),
      address: z.string().trim().max(500).nullish(),
      latitude: generalFields.latitude,
      longitude: generalFields.longitude,
      provider: z.string().trim().max(30).nullish(),
      providerPlaceId: z.string().trim().max(255).nullish(),
    })
    .refine((b) => !b.providerPlaceId || !!b.provider, {
      message: "provider is required when providerPlaceId is set",
      path: ["provider"],
    }),
};

export const placeIdParam = { params: idParams("placeId") };

export type SearchPlacesQuery = z.infer<typeof searchPlaces.query>;
export type CreatePlaceDTO = z.infer<typeof createPlace.body>;
