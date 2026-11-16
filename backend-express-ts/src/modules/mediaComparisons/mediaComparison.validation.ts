import { z } from "zod";
import { generalFields, idParams, paginationQuery } from "../../common/validation";

export const listComparisons = { query: paginationQuery };

export const createComparison = {
  body: z
    .object({
      leftMediaAssetId: generalFields.id,
      rightMediaAssetId: generalFields.id,
      label: z.string().trim().max(120).nullish(),
    })
    .refine((b) => b.leftMediaAssetId !== b.rightMediaAssetId, {
      message: "Left and right media must be different",
      path: ["rightMediaAssetId"],
    }),
};

export const updateComparison = {
  params: idParams("comparisonId"),
  body: z.object({ label: z.string().trim().max(120).nullable() }),
};

export const comparisonIdParam = { params: idParams("comparisonId") };

export type CreateComparisonDTO = z.infer<typeof createComparison.body>;
export type UpdateComparisonDTO = z.infer<typeof updateComparison.body>;
