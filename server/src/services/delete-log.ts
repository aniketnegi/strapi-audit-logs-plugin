import { pluginId } from '../utils/pluginId';
import { Core } from '@strapi/strapi';
import type { LogAge, LogSettings } from '../utils/types';

const checkLogAge = async (logAge: LogAge, { strapi }) => {
  const cutoffDate = new Date();
  switch (logAge.interval) {
    case 'day':
      cutoffDate.setDate(cutoffDate.getDate() - logAge.value);
      break;
    case 'week':
      cutoffDate.setDate(cutoffDate.getDate() - logAge.value * 7);
      break;
    case 'month':
      cutoffDate.setMonth(cutoffDate.getMonth() - logAge.value);
      break;
    case 'year':
      cutoffDate.setFullYear(cutoffDate.getFullYear() - logAge.value);
      break;
    default:
      throw new Error('Invalid log age interval');
  }

  // console.log('CUTOFF DATE ::', cutoffDate.toDateString());

  const recordsToDelete = await strapi.documents(`plugin::${pluginId}.log`).findMany({
    sort: { createdAt: 'asc' }, // oldest first
    filters: {
      createdAt: {
        $lte: cutoffDate.toISOString(),
      },
    },
  });
  // console.log('RECORDS TO DELETE ::', recordsToDelete);

  recordsToDelete.forEach(async (record) => {
    await strapi.db.query(`plugin::${pluginId}.log`).delete({
      documentId: record.documentId,
    });
  });

  const logEntry = {
    user: 'Log Plugin',
    http_method: 'DELETE',
    request_body: '{"action": "delete old logs"}',
  };

  // console.log(logEntry);
  await strapi.documents(`plugin::${pluginId}.log`).create({ data: logEntry });
};

const checkLogCount = async (logCount, { strapi }) => {
  const totalCount = await strapi.db.query(`plugin::${pluginId}.log`).count();

  if (totalCount > logCount.value) {
    // Get IDs of records to DELETE (older ones)
    const recordsToDelete = await strapi.db.query(`plugin::${pluginId}.log`).findMany({
      select: ['id'],
      orderBy: { createdAt: 'asc' }, // oldest first
      limit: totalCount - logCount.value,
    });

    recordsToDelete.forEach(async (record) => {
      await strapi.db.query(`plugin::${pluginId}.log`).delete({
        documentId: record.documentId,
      });
    });

    const logEntry = {
      user: 'Log Plugin',
      http_method: 'DELETE',
      request_body: '{"action": "delete old logs"}',
    };

    // console.log(logEntry);
    await strapi.documents(`plugin::${pluginId}.log`).create({ data: logEntry });
  }
};

export const DeleteLogService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async deleteJob() {
    const settings = (await strapi
      .store({ type: 'plugin', name: pluginId })
      .get({ key: 'log-settings' })) as LogSettings;

    if (!settings.enabled) return;
    // console.log('SETTINGS ::', settings);

    switch (settings.frequency) {
      case 'logAge':
        await checkLogAge(settings.logAge, { strapi });
        break;
      case 'logCount':
        await checkLogCount(settings.logCount, { strapi });
        break;
      default:
        throw Error('Frequency value is incorrent');
    }
  },
});
