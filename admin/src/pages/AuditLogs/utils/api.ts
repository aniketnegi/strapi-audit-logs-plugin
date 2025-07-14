import { stringify } from 'qs';
import pluginId from '../../../pluginId';

import { getFetchClient } from '@strapi/strapi/admin';

const fetchLogs = async (queryParams: any) => {
  // console.log('HI');
  // console.log('Welcome to <fetchLogs>');
  // console.log('Query Params: ', queryParams);

  const { get } = getFetchClient();

  const queryStr = `/${pluginId}/logs`;
  // console.log('Trying to fetch Result', queryStr);
  const result = await get(
    `/${pluginId}/logs${queryParams ? `?${stringify(queryParams, { encode: false })}` : ''}`
  );

  // console.log('RESULT', result);
  // const url = result.request.responseURL.match(`\\/(${pluginId})\\/logs(?:\\?[^#]*)?(?:#.*)?`)[0];
  // console.log('URL: ', url);

  // if (result.config.url !== url) {
  //   console.log('Redirecting to settings page with /settings', url);
  //   return {
  //     location: `/settings${url}`,
  //   };
  // }
  // console.log('Returning logs data', result.data);
  // console.log('Exiting <fetchLogs>');
  return { result: result.data };
};

export default fetchLogs;
