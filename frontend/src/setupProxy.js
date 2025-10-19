const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy Firebase Functions requests to localhost:5001
  app.use(
    '/functions',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      pathRewrite: {
        '^/functions': '', // Remove /functions prefix
      },
    })
  );
};