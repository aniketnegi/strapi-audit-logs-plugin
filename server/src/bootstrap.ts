import type { Core } from '@strapi/strapi';
import { pluginId } from './utils/pluginId';

const initLogSettings = async (pluginStore) => {
  const already = await pluginStore.get({ key: 'log-settings' });
  console.log(already);
  // if (already) return;

  await pluginStore.set({
    key: 'log-settings',
    value: {
      enabled: true,
      frequency: 'logAge',
      logAge: { value: 90, interval: 'day' },
    },
  });
};

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  /* 1. Seed default plugin settings */
  const pluginStore = strapi.store({ type: 'plugin', name: pluginId });
  await initLogSettings(pluginStore);

  /* 2. Daily cleanup cron */
  strapi.cron.add({
    auditLogCleanup: {
      task: async ({ strapi }) => {
        await strapi.plugin(pluginId).service('delete-log').deleteJob();
      },
      options: { rule: '0 0 * * *' }, // every day at midnight
    },
  });
};

export default bootstrap;
