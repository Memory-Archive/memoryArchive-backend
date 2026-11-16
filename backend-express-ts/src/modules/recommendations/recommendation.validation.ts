import { z } from "zod";
import { paginationQuery } from "../../common/validation";

export const getRecommendations = {
  query: z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    radiusKm: z.coerce.number().positive().max(100).default(10),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
};

export const createFeedback = {
  body: z
    .object({
      providerPlaceId: z.string().trim().min(1).max(255),
      rating: z.number().int().min(1).max(5).nullish(),
      feedbackText: z.string().trim().max(1000).nullish(),
    })
    .refine((b) => b.rating != null || !!b.feedbackText, "Provide a rating or feedbackText"),
};

export const listFeedback = { query: paginationQuery };

export type GetRecommendationsQuery = z.infer<typeof getRecommendations.query>;
export type CreateFeedbackDTO = z.infer<typeof createFeedback.body>;
