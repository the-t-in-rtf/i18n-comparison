/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("../");
fluid.require("%gpii-testem");

fluid.defaults("gpii.test.i18nComparison.testem", {
    gradeNames: ["gpii.testem"],
    instrumentSource: false,
    generateCoverageReport: false,
    sourceDirs: ["src"],
    serveDirs: ["src","node_modules"],
    testPages: [ "tests/browser/demo.html"]
});

module.exports = gpii.test.i18nComparison.testem().getTestemOptions();
