import { Core } from '@strapi/strapi';
import { pluginId } from '../utils/pluginId';

const LogService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async findPage(query) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const queryParams = {
      offset,
      limit: pageSize,
      // orderBy: query.sort ? [query.sort] : [{ createdAt: 'desc' }],
      where: query.filters || {},
    };

    console.log('Query Params ::', queryParams);

    const [results, total] = await Promise.all([
      strapi.db.query(`plugin::${pluginId}.log`).findMany(queryParams),
      strapi.db.query(`plugin::${pluginId}.log`).count({
        where: queryParams.where,
      }),
    ]);

    // console.log('RESULTS ::', results);
    // console.log('TOTAL ::', total);

    const pagination = {
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
      total,
    };

    return {
      results,
      pagination,
    };
  },
});

export default LogService;
