// api/index.js
const path = require('path');

let cachedHandler;

module.exports = async (req, res) => {
  try {
    if (!cachedHandler) {
      // Debug: scan what actually exists at runtime
      const fs = require('fs');
      const taskDir = path.join(__dirname, '..');
      let taskFiles, distFiles;

      try {
        taskFiles = fs.readdirSync(taskDir).slice(0, 40);
      } catch (e) {
        taskFiles = [e.message];
      }

      try {
        distFiles = fs.readdirSync(path.join(taskDir, 'dist')).slice(0, 40);
      } catch (e) {
        distFiles = [e.message];
      }

      let mod;
      try {
        mod = require('../dist/serverless');
      } catch (requireError) {
        return res.status(500).json({
          phase: 'require',
          error: requireError.message,
          taskRoot: taskFiles,
          distContents: distFiles,
        });
      }

      try {
        cachedHandler = await mod.createApp();
      } catch (initError) {
        return res.status(500).json({
          phase: 'init',
          error: initError.message,
          stack: initError.stack?.split('\n').slice(0, 10),
        });
      }
    }

    return cachedHandler(req, res);
  } catch (runtimeError) {
    return res.status(500).json({
      phase: 'runtime',
      error: runtimeError.message,
    });
  }
};