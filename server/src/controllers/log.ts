import { defaultsDeep, isEqual } from 'lodash/fp';
import { stringify } from 'qs';
import z from 'zod';
import { pluginId } from '../utils/pluginId';
import { Core } from '@strapi/strapi';

const MAX_PAGE_SIZE = 100;

// Zod schema for incoming query validation
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(MAX_PAGE_SIZE).default(10),
  sort: z.string().default('createdAt:DESC'),
  filters: z.any().optional(), // Add shape if you want stricter control
});

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async create(ctx) {
    ctx.throw(403, 'Creation of audit log entries is not allowed');
  },

  async update(ctx) {
    ctx.throw(403, 'Modification of audit log entries is not allowed');
  },

  async delete(ctx) {
    ctx.throw(403, 'Deletion of audit log entries is not allowed');
  },

  async export(ctx) {
    try {
      const { format = 'csv', ...queryParams } = ctx.query;

      // Remove pagination for export - get all records
      const exportQuery = {
        ...queryParams,
        pageSize: 999999, // Get all records
        page: 1,
      };

      const { results } = await strapi.plugin(pluginId).service('log').findPage(exportQuery);

      // console.log('DOWNLOAD ::', results);

      return { data: results };
    } catch (error) {
      ctx.throw(500, 'Export failed');
    }
  },

  async getLogs(ctx: any) {
    // console.log('Welcome to <getLogs>');
    // console.log('Input to function (ctx)', ctx);
    const {
      state: { userAbility },
      query: rawQuery = {},
    } = ctx;

    // 1. Permissions
    const pm = strapi.admin.services.permission.createPermissionsManager({
      ability: userAbility,
      action: `plugin::${pluginId}.read`,
      model: `plugin::${pluginId}.log`,
    });
    const isAllowed = typeof pm.isAllowed === 'function' ? await pm.isAllowed() : pm.isAllowed;

    if (!isAllowed) {
      return ctx.forbidden();
    }
    //
    // 2. Default query + Zod validation
    const defaultQuery = {
      page: 1,
      pageSize: 10,
      sort: 'createdAt:DESC',
    };

    const mergedQuery = defaultsDeep(defaultQuery, rawQuery);
    const parsed = querySchema.safeParse(mergedQuery);

    if (!parsed.success) {
      ctx.badRequest('Invalid query parameters', parsed.error.flatten());
      return;
    }

    const validatedQuery = parsed.data;

    // 3. Redirect if query was incomplete (non-canonical)
    // if (!isEqual(rawQuery, validatedQuery)) {
    //   ctx.redirect(`/${pluginId}/logs?${stringify(validatedQuery, { encode: false })}`);
    //   return;
    // }

    // 4. Permissions query wrapping
    const pmQuery = pm.addPermissionsQueryTo(validatedQuery);
    const sanitizedQuery = await pm.sanitizeQuery(pmQuery);

    // 5. Optional max page size enforcement
    sanitizedQuery.pageSize = Math.min(sanitizedQuery.pageSize, MAX_PAGE_SIZE);

    // console.log('SanitizedQuery: ', sanitizedQuery);

    // 6. Fetch data
    const { results: entries, pagination } = await strapi
      .plugin(pluginId)
      .service('log')
      .findPage(sanitizedQuery);
    // const entries = await strapi.plugin(pluginId).service('log').findPage(sanitizedQuery);

    const sanitizedEntries = await pm.sanitizeOutput(entries);
    // console.log('Hi');
    // console.log('sanitizedEntries', sanitizedEntries);
    // console.log('Pagination', pagination);
    //

    // test
    // console.log('Deleting old entries...');
    // strapi.plugin(pluginId).service('delete-log').deleteJob();
    // console.log('deleted old entries');

    // 7. Return
    return {
      results: sanitizedEntries,
      pagination,
    };
  },
});
