import { mapValues } from 'lodash';
import { pluginId } from '../utils/pluginId'; // → default export
import { Core } from '@strapi/strapi';
import { LogConfig } from '../utils/types';

type Filter<T> = { include?: T[]; exclude?: T[] };

function getFilterResult<T>(
  rule: Filter<T> | undefined,
  actual: T,
  cmp: (a: T, b: T) => boolean = (a, b) => a === b
) {
  if (!rule) return true;
  if (rule.include) return rule.include.some((v) => cmp(v, actual));
  if (rule.exclude) return !rule.exclude.some((v) => cmp(v, actual));
  return true;
}

const redact = (obj: string, keys: string[]): unknown =>
  mapValues(obj, (v: any, k: any) =>
    keys.includes(k) ? '#_REDACTED_#' : typeof v === 'object' && v !== null ? redact(v, keys) : v
  );

// ────────────────────────────────────────────────────────────────────────────
export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: any) => {
    // console.log('Hello, before Await.');
    await next();
    // console.log('Hello, After Await.');

    /* 1 ▸ read plugin config */
    const cfg = strapi.config.get(`plugin::${pluginId}`) as LogConfig; // UID-notation
    if (!cfg?.filters) return;

    /* 2 ▸ apply filters */
    const { endpoint, method, status } = cfg.filters;
    const ok =
      getFilterResult(endpoint, ctx.url, (p, u) => u.startsWith(p)) &&
      getFilterResult(method, ctx.method) &&
      getFilterResult(status, ctx.status);

    if (!ok) return;

    /* 3 ▸ redact sensitive keys */
    const redactedKeys: string[] = cfg.redactedValues ?? [];
    const reqBody = ctx.request.body ? redact(ctx.request.body, redactedKeys) : {};
    const resBody = ctx.body ? redact(ctx.body, redactedKeys) : {};

    /* 4 ▸ persist the log  */
    const logEntry = {
      user: ctx.state.user?.email ?? 'Anonymous',
      url: ctx.url,
      ip_address: ctx.ip,
      http_method: ctx.method,
      http_status: ctx.status,
      request_body: reqBody,
      response_body: resBody,
    };

    // console.log(logEntry);
    await strapi.documents(`plugin::${pluginId}.log`).create({ data: logEntry });
  };
};
