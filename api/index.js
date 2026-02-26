// api/index.js
let cachedHandler;

module.exports = async (req, res) => {
  try {
    if (!cachedHandler) {
      let mod;

      try {
        mod = require('../dist/src/serverless');
      } catch (requireError) {
        console.error('REQUIRE FAILED:', requireError);
        const fs = require('fs');
        const path = require('path');

        // Scan dist to find where files actually are
        const distDir = path.join(__dirname, '..', 'dist');
        let files = [];
        try {
          files = fs.readdirSync(distDir).slice(0, 30);
        } catch (e) {
          files = ['dist/ directory does not exist'];
        }

        let srcFiles = [];
        try {
          srcFiles = fs.readdirSync(path.join(distDir, 'src')).slice(0, 30);
        } catch (e) {
          srcFiles = ['dist/src/ does not exist'];
        }

        return res.status(500).json({
          phase: 'require',
          error: requireError.message,
          distFiles: files,
          distSrcFiles: srcFiles,
        });
      }

      try {
        cachedHandler = await mod.createApp();
      } catch (initError) {
        console.error('INIT FAILED:', initError);
        return res.status(500).json({
          phase: 'init',
          error: initError.message,
          stack: initError.stack,
        });
      }
    }

    return cachedHandler(req, res);
  } catch (runtimeError) {
    console.error('RUNTIME FAILED:', runtimeError);
    return res.status(500).json({
      phase: 'runtime',
      error: runtimeError.message,
    });
  }
};