'use strict';

/* eslint-disable @typescript-eslint/no-require-imports */
const { copyFileSync, mkdirSync } = require('node:fs');
const { dirname, resolve } = require('node:path');

const source = resolve('src/plugins/ai-assistant/strapi-server.js');
const target = resolve('dist/src/plugins/ai-assistant/strapi-server.js');
mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
