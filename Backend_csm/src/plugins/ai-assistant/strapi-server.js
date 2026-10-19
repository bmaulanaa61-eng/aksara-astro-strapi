'use strict';

// Strapi requires a CommonJS entry; the server factory itself is compiled from TypeScript into dist.
/* eslint-disable @typescript-eslint/no-require-imports */
module.exports = require('../../../dist/src/plugins/ai-assistant/server').default;
