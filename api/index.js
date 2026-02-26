// api/index.js
let cachedApp;

module.exports = async (req, res) => {
  if (!cachedApp) {
    const { createApp } = require('../dist/serverless');
    cachedApp = await createApp();
  }
  return cachedApp(req, res);
};