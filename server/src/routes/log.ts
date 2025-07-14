import { pluginId } from '../utils/pluginId';

export const LogRoutes = {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: `/logs`,
      handler: 'log.getLogs',
      config: {
        policies: [
          {
            name: 'admin::hasPermissions',
            config: {
              actions: [`plugin::${pluginId}.read`],
            },
          },
        ],
      },
    },
    {
      method: 'GET',
      path: '/logs/export',
      handler: 'log.export',
      config: {
        policies: [],
        auth: {
          scope: [`plugin::${pluginId}.read`],
        },
      },
    },
    // Block all write operations
    {
      method: 'POST',
      path: '/logs',
      handler: 'log.create',
      config: {
        policies: [
          `plugin::${pluginId}.read-only-logs`,

          {
            name: 'admin::hasPermissions',
            config: {
              actions: [`plugin::${pluginId}.read`],
            },
          },
        ],
      },
    },
    {
      method: 'PUT',
      path: '/logs/:id',
      handler: 'log.update',
      config: {
        policies: [
          `plugin::${pluginId}.read-only-logs`,

          {
            name: 'admin::hasPermissions',
            config: {
              actions: [`plugin::${pluginId}.read`],
            },
          },
        ],
      },
    },
    {
      method: 'DELETE',
      path: '/logs/:id',
      handler: 'log.delete',
      config: {
        policies: [
          `plugin::${pluginId}.read-only-logs`,

          {
            name: 'admin::hasPermissions',
            config: {
              actions: [`plugin::${pluginId}.read`],
            },
          },
        ],
      },
    },
  ],
};
