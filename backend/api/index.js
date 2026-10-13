let appModule;
try {
  appModule = require('../dist/app.js');
} catch (e) {
  appModule = require('../dist/index.js');
}

const app = appModule.default || appModule;

module.exports = app;
module.exports.default = app;
