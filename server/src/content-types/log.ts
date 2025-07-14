export const log = {
  kind: 'collectionType',
  collectionName: 'log',
  info: {
    singularName: 'log',
    pluralName: 'logs',
    displayName: 'Logs',
  },
  options: {
    draftAndPublish: false,
    comment: '',
  },
  pluginOptions: {
    'content-manager': {
      visible: false,
      actions: {
        create: false,
        update: false,
        delete: false,
        publish: false,
      },
    },
    'content-type-builder': {
      visible: false,
    },
  },
  attributes: {
    user: {
      type: 'text',
    },
    url: {
      type: 'text',
    },
    ip_address: {
      type: 'text',
    },
    http_method: {
      type: 'string',
    },
    http_status: {
      type: 'integer',
    },
    request_body: {
      type: 'json',
    },
    response_body: {
      type: 'json',
    },
  },
};
