let appModule;
try {
  appModule = require('../backend/dist/app.js');
} catch (e) {
  try {
    appModule = require('../backend/dist/index.js');
  } catch (err) {
    appModule = require('./backend/dist/app.js');
  }
}

const app = appModule.default || appModule;

module.exports = app;
module.exports.default = app;
