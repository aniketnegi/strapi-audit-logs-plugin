import pluginPkg from '../../../package.json';

export const pluginId = pluginPkg.strapi.name.replace(/^(@[^-,.][\w,-]+\/|strapi-)plugin-/i, '');
