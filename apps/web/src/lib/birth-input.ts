/**
 * Validation shared by everything that accepts a birth date: the chart API
 * and saved charts must agree on what can be cast, or a chart could be
 * saved that no room is able to open.
 */
import { z } from "zod";

/** A calendar date inside the years the bundled ephemeris covers. */
export const BirthDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (d) => {
      const year = Number(d.slice(0, 4));
      return year >= 1800 && year <= 2399;
    },
    { message: "Dates between the years 1800 and 2399 are supported." }
  );
