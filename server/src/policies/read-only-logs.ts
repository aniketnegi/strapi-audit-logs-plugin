export default (policyContext, config, { strapi }) => {
  const { request } = policyContext;

  console.log('POLICY CONTEXT ::', policyContext);

  // Allow only GET requests (read operations)
  if (request.method === 'GET') {
    return false;
  }

  // Block all write operations (POST, PUT, DELETE, PATCH)
  console.log(`Blocked ${request.method} request to audit logs: ${request.url}`);
  return true;
};
