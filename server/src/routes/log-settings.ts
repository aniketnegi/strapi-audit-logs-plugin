import { pluginId } from '../utils/pluginId';

export const LogSettingRoutes = {
  routes: [
    {
      method: 'GET',
      path: '/settings',
      handler: 'log-settings.getSettings',
      config: {
        policies: [
          {
            name: 'admin::hasPermissions',
            config: {
              actions: [`plugin::${pluginId}.settings.read`],
            },
          },
        ],
      },
    },
    {
      method: 'PUT',
      path: '/settings',
      handler: 'log-settings.updateSettings',
      config: {
        policies: [
          {
            name: 'admin::hasPermissions',
            config: {
              actions: [`plugin::${pluginId}.settings.update`],
            },
          },
        ],
      },
    },
  ],
};
