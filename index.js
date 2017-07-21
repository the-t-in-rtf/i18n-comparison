/* eslint-env node */
// Include all server side components and register our working directory.
//
"use strict";
var fluid = require("infusion");
fluid.module.register("i18n-comparison", __dirname, require);

require("./src/js/translator");
require("./src/js/infusion");
require("./src/js/i18next");
