import { errors } from '@strapi/utils';
import { pluginId } from '../utils/pluginId';
import { z } from 'zod';
import { Core } from '@strapi/strapi';

const { ValidationError } = errors;

const INTERVAL_OPTIONS = ['day', 'week', 'month', 'year'] as const;
const FREQUENCY_OPTIONS = ['logAge', 'logCount'] as const;

export const logAgeSchema = z.object({
  value: z.number().min(1),
  interval: z.enum(INTERVAL_OPTIONS),
});

export const logCountSchema = z.object({
  value: z.number().min(1),
});

export const settingsSchema = z.object({
  enabled: z.boolean(),
  frequency: z.enum(FREQUENCY_OPTIONS),
  logAge: logAgeSchema,
  logCount: logCountSchema,
});

export const rawSettingsSchema = z.object({
  enabled: z.boolean(),
  frequency: z.enum(FREQUENCY_OPTIONS),
  options: z.union([logAgeSchema, logCountSchema]),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
type RawSettingsInput = z.infer<typeof rawSettingsSchema>;

const defaultSettings: SettingsInput = {
  enabled: false,
  frequency: 'logAge',
  logAge: {
    value: 90,
    interval: 'day',
  },
  logCount: {
    value: 1000,
  },
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async getSettings(ctx: any) {
    const rawSettings = (await strapi.config.get(
      `plugin::${pluginId}.deletion`
    )) as RawSettingsInput;

    if (!rawSettings) {
      ctx.send({ settings: defaultSettings });
      return;
    }

    const settings: SettingsInput = {
      enabled: rawSettings?.enabled ?? false,
      frequency: rawSettings?.frequency ?? 'logAge',
      logAge: {
        value: rawSettings?.options?.value ?? 90,
        // @ts-ignore
        interval: rawSettings?.options?.interval ?? 'day',
      },
      logCount: {
        value: rawSettings?.options?.value ?? 1000,
      },
    };

    ctx.send({ settings });
  },

  async updateSettings(ctx: any) {
    const { body } = ctx.request;

    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Request body is incorrect', {
        details: parsed.error.flatten(),
      });
    }

    const input = parsed.data;

    const options: Record<string, any> = {
      value: input.frequency === 'logAge' ? input.logAge.value : input.logCount.value,
    };

    if (input.frequency === 'logAge') {
      options.interval = input.logAge.interval;
    }

    const payload = {
      enabled: input.enabled,
      frequency: input.frequency,
      options,
    };

    const settings = await strapi.config.get(`plugin.${pluginId}`);
    // @ts-ignore
    settings.deletion = payload;

    strapi.config.set(`plugin.${pluginId}`, settings);

    // Restart the job
    strapi.plugin(pluginId).service('delete-log').deleteJob();

    ctx.send({ ok: true });
  },
});
