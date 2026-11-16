import type { ValueTransformer } from "typeorm";

/**
 * mysql2 returns BIGINT and DECIMAL columns as strings to avoid precision loss.
 * File sizes and durations fit comfortably in a JS number, so convert them.
 */
export const numericTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) => (value === null || value === undefined ? value : Number(value)),
};
