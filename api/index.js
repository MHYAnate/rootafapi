let cachedHandler;

module.exports = async (req, res) => {
  try {
    if (!cachedHandler) {
      let mod;

      try {
        // ✅ Now requires from co-located _dist directory
        mod = require('./_dist/serverless');
      } catch (requireError) {
        const fs = require('fs');
        const path = require('path');

        let apiFiles;
        try {
          apiFiles = fs.readdirSync(__dirname).slice(0, 30);
        } catch (e) {
          apiFiles = [e.message];
        }

        return res.status(500).json({
          phase: 'require',
          error: requireError.message,
          apiDirContents: apiFiles,
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