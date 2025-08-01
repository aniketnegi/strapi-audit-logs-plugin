import { prefixPluginTranslations } from './utils/getTranslation';
import pluginId from './pluginId';
import Initializer from './components/Initializer';
import PluginIcon from './components/PluginIcon';
import ProtectedLogs from './pages/AuditLogs';
import ProtectedSettings from './pages/Settings';
import { Component } from 'react';
// import RootWithQueryClient from './RootWithQueryClient';

const AuditLogs = async () => {
  const component = await import('./pages/AuditLogs');

  return component;
};

const Settings = async () => {
  const component = await import('./pages/Settings');

  return component;
};

export default {
  register(app: any) {
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name: pluginId,
    });

    app.createSettingSection(
      {
        id: `${pluginId}.section`,
        intlLabel: {
          id: `${pluginId}.section.label`,
          defaultMessage: 'Audit Log plugin',
        },
      },
      [
        {
          intlLabel: {
            id: `${pluginId}.section.logs.label`,
            defaultMessage: 'Logs',
          },
          id: `${pluginId}.section.logs`,
          to: `/settings/${pluginId}/logs`,
          Component: AuditLogs,
          permissions: [{ action: `plugin::${pluginId}.read`, subject: null }],
        },
        {
          intlLabel: {
            id: `${pluginId}.section.log-settings.label`,
            defaultMessage: 'Log Settings',
          },
          id: `${pluginId}.section.log-settings`,
          to: `/settings/${pluginId}/settings`,
          Component: Settings,
          permissions: [{ action: `plugin::${pluginId}.settings.read`, subject: null }],
        },
      ]
    );
  },

  async registerTrads({ locales }: { locales: string[] }) {
    const importedTrads = await Promise.all(
      locales.map((locale) =>
        import(/* webpackChunkName: "translation-[request]" */ `./translations/${locale}.json`)
          .then(({ default: data }) => ({
            data: prefixPluginTranslations(data, pluginId),
            locale,
          }))
          .catch(() => ({
            data: {},
            locale,
          }))
      )
    );

    return Promise.resolve(importedTrads);
  },
};
