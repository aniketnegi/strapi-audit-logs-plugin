import { schema } from './configSchema';

export default {
  default: {},
  validator(config: unknown) {
    schema.parse(config);
  },
};
