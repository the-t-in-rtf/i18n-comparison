/* globals require */
(function (fluid) {
    "use strict";
    fluid = fluid || require("infusion");
    fluid.setLogging(true);

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

        var quoteData = fluid.generate(100000, function () {
            var key1 = Math.round(Math.random() * 1);
            var key2 = Math.round(Math.random() * 23);
            return that.model.quotes[key1][key2];
        }, true);

        var translatorComponents = fluid.queryIoCSelector(that, "gpii.i18nComparison.translator", true);
        fluid.each(translatorComponents, function (translatorComponent) {
            var startTime = Date.now();
            console.log("Demonstrating component '" + translatorComponent.typeName + "'...");

            console.log("Language data (by locale)...");
            fluid.each(locales, function (locale) {
                console.log("'", locale, "' = ", translatorComponent.translate("static", {}, locale));
            });
            console.log(Date.now() - startTime, " total milliseconds elapsed...");

            console.log("Language data (by language)...");
            fluid.each(languages, function (language) {
                console.log("'", language, "' = ", translatorComponent.translate("static", {}, language));
            });
            console.log(Date.now() - startTime, " total milliseconds elapsed...");

            console.log("Variable interpolation (100,000 passes)...");
            fluid.each(quoteData, function (quote, index) {
                var generatedText = translatorComponent.translate("variable", { quote: quote }, "en_US");
                if (index === 0) {
                    console.log("Sample variable interpolation output: ", generatedText);
                }
            });
            console.log(Date.now() - startTime, " total milliseconds elapsed...");
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
})(fluid);

