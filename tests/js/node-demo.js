/* eslint-env node */
"use strict";
var fluid = require("infusion");
fluid.setLogging(true);
var gpii = fluid.registerNamespace("gpii");

fluid.require("%i18n-comparison");

require("./lib/demo");

var messageBundle = require("../data/glass.json5");
var quotes = require("../data/prout.json5");

gpii.i18nComparison.demo({
    model: {
        messageBundle: messageBundle,
        quotes: quotes
    },
    listeners: {
        "onCreate.createTranslators": {
            func: "{that}.events.onMessageBundleLoaded.fire"
        }
    }
});
