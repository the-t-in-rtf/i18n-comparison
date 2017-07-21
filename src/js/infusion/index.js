/* globals require */
(function () {
    "use strict";
    var fluid = fluid || require("infusion");
    var gpii = fluid.registerNamespace("gpii");

    fluid.registerNamespace("gpii.i18nComparison.infusion");

    // TODO: Make a browser-friendly approach to this.
    gpii.i18nComparison.infusion.loadMessages = function () {
        var messageBase = {};
        var messageBundle = require("../../../tests/data/glass.json5");
        /* eslint-disable */
        /*
         Our sample data looks like:

         {
         "locale": "sa_IN",
         "language": "sa",
         "country": "IN",
         "title": "Sanskrit",
         "text": "﻿काचं शक्नोम्यत्तुम् । नोपहिनस्ति माम् ॥"
         },

         We generate a list of values suffixed by locale, as in:

         "static":       "﻿काचं शक्नोम्यत्तुम् । नोपहिनस्ति माम् ॥"
         "static_sa":    "﻿काचं शक्नोम्यत्तुम् । नोपहिनस्ति माम् ॥"
         "static_sa_IN": "﻿काचं शक्नोम्यत्तुम् । नोपहिनस्ति माम् ॥"

         */
        /* eslint-enable */
        // The first entry for a given key wins. This is purely for demonstration purposes, we should discuss a cleaner
        // fallback strategy.
        fluid.each(messageBundle, function (entry) {
            var keys = ["static", "static" + "_" + entry.locale, "static" + "_" + entry.language];
            fluid.each(keys, function (key) {
                if (!messageBase[key]) {
                    messageBase[key] = entry.text;
                }
            });
        });

        messageBase.variable = "As my father used to say: '%quote'.";

        return messageBase;
    };

    gpii.i18nComparison.infusion.translate = function (that, messageKey, variableContent, locale) {
        var keys = [messageKey + "_" + locale, messageKey];

        return fluid.find(keys, function (key) {
            // TODO: Discuss adding support for resolving dot paths, so that we can organize message bundles into categories rather than having a thousand at the same top level.
            // https://github.com/fluid-project/infusion/blob/16a963d63dce313ab3f2e3a81c725c2cbef0af79/src/framework/renderer/js/fluidRenderer.js#L68
            var resolvedMessage = that.msgResolver.resolve(key, variableContent);
            // TODO: I know this is terrible, but I can't seem to use the lookup invoker to check for the existence of a value up front.  It always returns `undefined`.
            if (resolvedMessage.indexOf("not found") === -1) { return resolvedMessage; }
        });
    };

    // TODO: Discuss the fact that the resource loader seems to only support one language per component, which is why I bypassed it.
    fluid.defaults("gpii.i18nComparison.infusion", {
        gradeNames: ["gpii.i18nComparison.translator"],
        messageBase: "@expand:gpii.i18nComparison.infusion.loadMessages()",
        distributeOptions: {
            source: "{that}.options.messageBase",
            target: "{that > msgResolver}.options.messageBase"
        },
        components: {
            msgResolver: {
                type: "fluid.messageResolver"
            }
        },
        invokers: {
            "translate": {
                funcName: "gpii.i18nComparison.infusion.translate",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"] // messageKey, variableContent, locale
            }
        }
    });
})();
