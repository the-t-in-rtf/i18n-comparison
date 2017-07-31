/* globals require */
(function (fluid) {
    "use strict";
    fluid = fluid || require("infusion");
    var gpii = fluid.registerNamespace("gpii");

    fluid.registerNamespace("gpii.i18nComparison.infusion");

    // TODO: Make a browser-friendly approach to this.
    gpii.i18nComparison.infusion.loadMessages = function (that) {
        var messageBase = {};
        /*
         Our sample data looks like:

         {
         "locale": "sa_IN",
         "language": "sa",
         "country": "IN",
         "title": "Sanskrit",
         "text": "काचं शक्नोम्यत्तुम् । नोपहिनस्ति माम् ॥"
         },

         We generate a list of values suffixed by locale, as in:

         "static":       "काचं शक्नोम्यत्तुम् । नोपहिनस्ति माम् ॥"
         "static_sa":    "काचं शक्नोम्यत्तुम् । नोपहिनस्ति माम् ॥"
         "static_sa_IN": "काचं शक्नोम्यत्तुम् । नोपहिनस्ति माम् ॥"

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
            // TODO: The real implementation will have a function and unit tests for this bit.
            // Turn a locale or partial locale into its component bits so that we end up looking up the first match of
            //
            //   1. `key-{locale}`, as in `key-en_US`
            //   2. `key-{language}`, as in `key-en`
            //   3. `key`
            var keys = [messageKey];
            var segments = locale.split(/[-_]/);
            for (var a = 0; a < segments.length; a++) {
                var subSegments = segments.slice(0, a + 1);
                var generatedKey = subSegments ? messageKey + "-" + subSegments.join("_") : messageKey;
                keys.unshift(generatedKey);
            }

            // This uses fluid.find an other bits inside so that we get the first message we find.
            var resolvedMessage = that.msgResolver.lookup(keys);

            // Use the message key if we can't resolve it to a message bundle.  This allows us to pass inline template content to the translator as well.
            return resolvedMessage && resolvedMessage.template || fluid.stringTemplate(messageKey, variableContent);
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
