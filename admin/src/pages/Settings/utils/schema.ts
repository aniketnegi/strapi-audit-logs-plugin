import { z } from 'zod';

const schema = z.object({
  enabled: z.boolean().optional(),

  frequency: z.enum(['logAge', 'logCount']).optional(),

  logAge: z
    .object({
      value: z.number().min(1),
      interval: z.enum(['day', 'week', 'month', 'year']),
    })
    .optional(),

  logCount: z
    .object({
      value: z.number().min(1),
    })
    .optional(),
});

export default schema;
