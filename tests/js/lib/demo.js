/* globals require */
(function (fluid, window) {
    "use strict";
    fluid = fluid || require("infusion");
    fluid.setLogging(true);

    // TODO:  This seems very wrong.
    var jqUnit = window.jqUnit || require("node-jqunit");
    var gpii  = fluid.registerNamespace("gpii");

    if (typeof require !== "undefined") {
        fluid.require("%i18n-comparison");
        require("require-json5");
    }

    fluid.registerNamespace("gpii.i18nComparison.demo");

    gpii.i18nComparison.demo.getDistinct = function (originalArray) {
        var tempHash = {};
        fluid.each(originalArray, function (entry) { tempHash[entry] = true; });
        return Object.keys(tempHash);
    };

    gpii.i18nComparison.demo.demoAll = function (that) {
        var locales = fluid.transform(that.model.messageBundle, function (entry) { return entry.locale; });
        var languages = gpii.i18nComparison.demo.getDistinct(fluid.transform(that.model.messageBundle, function (entry) { return entry.language; }));

        var translatorComponents = fluid.queryIoCSelector(that, "gpii.i18nComparison.translator", true);
        fluid.each(translatorComponents, function (translatorComponent) {
            jqUnit.module("Testing component " + translatorComponent.typeName + "...");

            jqUnit.test(translatorComponent.typeName + ": Language data (by locale)...", function () {
                jqUnit.expect(locales.length);
                fluid.each(locales, function (locale) {
                    var translatedString = translatorComponent.translate("static", {}, locale);
                    jqUnit.assertTrue("There should be translated content for locale '" + locale + "'...", translatedString && translatedString.length > 0);
                });
            });

            jqUnit.test(translatorComponent.typeName + ": Language data (by language)...", function () {
                jqUnit.expect(languages.length);
                fluid.each(languages, function (language) {
                    var translatedString = translatorComponent.translate("static", {}, language);
                    jqUnit.assertTrue("There should be translated content for language '" + language + "'...", translatedString && translatedString.length > 0);
                });
            });

            // How many translations can be accomplished in a second?
            var translationPasses = 0;
            var translationStart = Date.now();
            while (Date.now() - translationStart < 1000) {
                var randomLocaleIndex = Math.round(Math.random() * (locales.length - 1));
                var locale = locales[randomLocaleIndex];
                translatorComponent.translate("static", {}, locale);
                translationPasses++;
            }
            console.log(translatorComponent.typeName, ": completed ", translationPasses, "translation passes in 1 second.");

            // TODO: Flip the script, see how many variable interpolations can be accomplished in a second.
            var interpolationPasses = 0;
            var interpolationStart = Date.now();
            while (Date.now() - interpolationStart < 1000) {
                var key1 = Math.round(Math.random() * 1);
                var key2 = Math.round(Math.random() * 23);
                var quote = that.model.quotes[key1][key2];
                translatorComponent.translate("variable", { quote: quote }, "en_US");
                interpolationPasses++;
            }
            console.log(translatorComponent.typeName, ": completed ", interpolationPasses, "variable interpolation passes in 1 second.");
        });
    };

    fluid.defaults("gpii.i18nComparison.demo", {
        gradeNames: ["fluid.modelComponent"],
        events: {
            onMessageBundleLoaded: null,
            onInfusionTranslatorReady: null,
            onI8nextTranslatorReady: null,
            onTranslatorsReady: {
                events: {
                    "onInfusionTranslatorReady": "onInfusionTranslatorReady",
                    "onI8nextTranslatorReady": "onI8nextTranslatorReady"
                }
            }
        },
        model: {
            // Although we don't yet use this in the demo work, I started with this as a model variable because IMO eventually we want to be able to reload bundles on the fly.
            messageBundle: {}
        },
        components: {
            infusion: {
                type: "gpii.i18nComparison.infusion",
                createOnEvent: "onMessageBundleLoaded",
                options: {
                    listeners: {
                        "onMessageBundleLoaded.notifyParent": {
                            func: "{gpii.i18nComparison.demo}.events.onInfusionTranslatorReady.fire"
                        }
                    },
                    model: {
                        messageBundle: "{gpii.i18nComparison.demo}.model.messageBundle"
                    }
                }
            },
            i18next: {
                type: "gpii.i18nComparison.i18next",
                createOnEvent: "onMessageBundleLoaded",
                options: {
                    listeners: {
                        "onMessageBundleLoaded.notifyParent": {
                            func: "{gpii.i18nComparison.demo}.events.onI8nextTranslatorReady.fire"
                        }
                    },
                    model: {
                        messageBundle: "{gpii.i18nComparison.demo}.model.messageBundle"
                    }
                }
            }
        },
        listeners: {
            "onTranslatorsReady.demoAll": {
                funcName: "gpii.i18nComparison.demo.demoAll",
                args: ["{that}"]
            }
        }
    });
})(fluid, typeof window === "undefined" ? { jqUnit: false } : window);

