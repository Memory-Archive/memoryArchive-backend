import { z } from "zod";
import { generalFields, idParams } from "../../common/validation";

export const updateProfile = {
  body: z
    .object({
      username: z
        .string()
        .trim()
        .min(3)
        .max(30)
        .regex(/^[a-zA-Z0-9_.]+$/, "Only letters, numbers, '_' and '.' are allowed"),
      displayName: z.string().trim().min(1).max(80).nullable(),
      bio: z.string().trim().max(500).nullable(),
    })
    .partial()
    .refine((b) => Object.keys(b).length > 0, "Provide at least one field to update"),
};

export const changePassword = {
  body: z
    .object({
      currentPassword: z.string().min(1),
      newPassword: generalFields.password,
    })
    .refine((b) => b.currentPassword !== b.newPassword, {
      message: "New password must differ from the current one",
      path: ["newPassword"],
    }),
};

export const userIdParam = { params: idParams("userId") };
export const sessionIdParam = { params: idParams("sessionId") };

export type UpdateProfileDTO = z.infer<typeof updateProfile.body>;
export type ChangePasswordDTO = z.infer<typeof changePassword.body>;
