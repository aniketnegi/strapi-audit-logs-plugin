import pluginId from '../../../pluginId';
import { getFetchClient } from '@strapi/strapi/admin';

const fetchLogSettings = async () => {
  const { get } = getFetchClient();
  const { data } = await get(`/${pluginId}/settings`);
  return data.settings;
};

const putLogSettings = async (body: any) => {
  const { put } = getFetchClient();
  await put(`/${pluginId}/settings`, body);
};

export { fetchLogSettings, putLogSettings };
