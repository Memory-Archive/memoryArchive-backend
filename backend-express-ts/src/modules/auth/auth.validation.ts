import { z } from "zod";
import { generalFields } from "../../common/validation";

export const signup = {
  body: z.object({
    username: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_.]+$/, "Only letters, numbers, '_' and '.' are allowed"),
    email: generalFields.email,
    password: generalFields.password,
    displayName: z.string().trim().min(1).max(80).optional(),
  }),
};

export const login = {
  body: z.object({
    email: generalFields.email,
    password: z.string().min(1),
    deviceName: z.string().trim().max(120).optional(),
  }),
};

export const refreshToken = {
  body: z.object({ refreshToken: z.string().min(1) }),
};

export const forgotPassword = {
  body: z.object({ email: generalFields.email }),
};

export const resetPassword = {
  body: z.object({
    token: z.string().min(1),
    password: generalFields.password,
  }),
};

export type SignupDTO = z.infer<typeof signup.body>;
export type LoginDTO = z.infer<typeof login.body>;
export type RefreshTokenDTO = z.infer<typeof refreshToken.body>;
export type ForgotPasswordDTO = z.infer<typeof forgotPassword.body>;
export type ResetPasswordDTO = z.infer<typeof resetPassword.body>;
