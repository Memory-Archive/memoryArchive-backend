import { z } from "zod";

// Reusable zod building blocks shared by the module validation files.

export const generalFields = {
  id: z.uuid(),
  date: z.iso.date(), // "YYYY-MM-DD"
  time: z.iso.time(), // "HH:MM[:SS]"
  datetime: z.coerce.date(),
  email: z.email().max(254).toLowerCase(),
  password: z.string().min(8).max(128),
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a hex colour like #AABBCC"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
};

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** Builds a params schema like `{ memoryId: uuid }` for the given route param names. */
export const idParams = <K extends string>(...keys: K[]) =>
  z.object(Object.fromEntries(keys.map((key) => [key, generalFields.id])) as Record<K, typeof generalFields.id>);
