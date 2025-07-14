import type { Core } from '@strapi/strapi';
import { pluginId } from './utils/pluginId';
import auditLogger from './middlewares';

const RBAC_ACTIONS = [
  {
    section: 'plugins',
    displayName: 'Read settings',
    uid: 'settings.read',
    pluginName: pluginId,
    subCategory: 'settings',
  },
  {
    section: 'plugins',
    displayName: 'Update settings',
    uid: 'settings.update',
    pluginName: pluginId,
    subCategory: 'settings',
  },
  { section: 'plugins', displayName: 'Access logs', uid: 'read', pluginName: pluginId },
];

const register = async ({ strapi }: { strapi: Core.Strapi }) => {
  /* 1. Attach request-logging middleware */
  strapi.server.use(auditLogger({}, { strapi }));

  /* 2. Declare RBAC actions */
  await strapi.admin.services.permission.actionProvider.registerMany(RBAC_ACTIONS);
};

export default register;
