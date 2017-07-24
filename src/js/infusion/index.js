/* globals require */
(function (fluid) {
    "use strict";
    fluid = fluid || require("infusion");
    var gpii = fluid.registerNamespace("gpii");

    fluid.registerNamespace("gpii.i18nComparison.infusion");

    // TODO: Make a browser-friendly approach to this.
    gpii.i18nComparison.infusion.loadMessages = function (that) {
        var messageBase = {};
        // TODO: I believe the i18n chars are incorrectly treated as irregular whitespace by ESLINT.  Make a simple example and file a bug.a
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
        fluid.each(that.model.messageBundle, function (entry) {
            var keys = ["static", "static" + "_" + entry.locale, "static" + "_" + entry.language];
            fluid.each(keys, function (key) {
                if (!messageBase[key]) {
                    messageBase[key] = entry.text;
                }
            });
        });

        messageBase.variable = "As my father used to say: '%quote'.";

        that.messageBase = messageBase;
        that.events.onMessageBundleLoaded.fire();
    };

    gpii.i18nComparison.infusion.translate = function (that, messageKey, variableContent, locale) {
        if (that.msgResolver) {
            var keys = [messageKey + "_" + locale, messageKey];

            var resolvedMessage = fluid.find(keys, function (key) {
                // TODO: Discuss adding support for resolving dot paths, so that we can organize message bundles into categories rather than having a thousand at the same top level.
                // https://github.com/fluid-project/infusion/blob/16a963d63dce313ab3f2e3a81c725c2cbef0af79/src/framework/renderer/js/fluidRenderer.js#L68
                var resolvedMessage = that.msgResolver.resolve(key, variableContent);
                // TODO: I know this is terrible, but I can't seem to use the lookup invoker to check for the existence of a value up front.  It always returns `undefined`.
                if (resolvedMessage.indexOf("not found") === -1) { return resolvedMessage; }
            });
            // Use the message key if we can't resolve it to a message bundle.  This allows us to pass inline template content to the translator as well.
            return resolvedMessage || fluid.stringTemplate(messageKey, variableContent);
        }
        else {
            fluid.fail("Not ready to translate yet...");
        }
    };

    // TODO: Discuss the fact that the resource loader seems to only support one language per component, which is why I bypassed it.
    fluid.defaults("gpii.i18nComparison.infusion", {
        gradeNames: ["gpii.i18nComparison.translator"],
        members: {
            messageBase: {}
        },
        components: {
            msgResolver: {
                type: "fluid.messageResolver",
                createOnEvent: "onMessageBundleLoaded",
                options: {
                    messageBase: "{gpii.i18nComparison.infusion}.messageBase"
                }
            }
        },
        listeners: {
            "onCreate.loadMessages": {
                funcName: "gpii.i18nComparison.infusion.loadMessages",
                args:     ["{that}"]
            }
        },
        invokers: {
            "translate": {
                funcName: "gpii.i18nComparison.infusion.translate",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"] // messageKey, variableContent, locale
            }
        }
    });
})(fluid);
