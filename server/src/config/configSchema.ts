import { z } from 'zod';

const stringArray = z.array(z.string());
const positiveIntArray = z.array(z.number().int().positive());

const includeExcludeMixed = (schema: z.ZodTypeAny) =>
  z
    .object({
      include: schema.optional(),
      exclude: schema.optional(),
    })
    .refine(
      (data) =>
        (data.include && !data.exclude) ||
        (data.exclude && !data.include) ||
        (!data.include && !data.exclude),
      {
        message: 'Either "include" or "exclude" should exist in each config, but not both',
      }
    )
    .refine(
      (data) =>
        (data.include ? schema.safeParse(data.include).success : true) &&
        (data.exclude ? schema.safeParse(data.exclude).success : true),
      {
        message: 'Invalid type for include/exclude values',
      }
    );

// Deletion object
const deletionObject = z.object({
  enabled: z.boolean().optional(),
  frequency: z.enum(['logAge', 'logCount']),
  options: z.union([
    z
      .object({
        value: z.number().min(1),
        interval: z.enum(['day', 'week', 'month', 'year']),
      })
      .strict(),
    z
      .object({
        value: z.number().min(1),
      })
      .strict(),
  ]),
});

// Full schema
export const schema = z.object({
  deletion: deletionObject.optional(),
  filters: z
    .object({
      endpoint: includeExcludeMixed(stringArray).optional(),
      status: includeExcludeMixed(positiveIntArray).optional(),
      method: includeExcludeMixed(stringArray).optional(),
    })
    .optional(),
  redactedValues: stringArray.optional(),
});
