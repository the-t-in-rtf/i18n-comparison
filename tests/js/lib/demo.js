/* globals require */
(function () {
    "use strict";
    var fluid = fluid || require("infusion");
    fluid.setLogging(true);

    var gpii  = fluid.registerNamespace("gpii");

    if (require) {
        fluid.require("%i18n-comparison");
        // TODO: We need to be sure this is also OK in the browser somehow.  Discuss
        require("require-json5");
    }

    fluid.registerNamespace("gpii.i18nComparison.demo");

    gpii.i18nComparison.demo.getDistinct = function (originalArray) {
        var tempHash = {};
        fluid.each(originalArray, function (entry) { tempHash[entry] = true; });
        return Object.keys(tempHash);
    };

    gpii.i18nComparison.demo.demoAll = function (that) {
        var demoData = require("../../data/glass.json5");
        var locales = fluid.transform(demoData, function (entry) { return entry.locale; });
        var languages = gpii.i18nComparison.demo.getDistinct(fluid.transform(demoData, function (entry) { return entry.language; }));

        var rawQuoteData = require("../../data/prout.json5");
        var quoteData = fluid.generate(100000, function () {
            var key1 = Math.round(Math.random() * 1);
            var key2 = Math.round(Math.random() * 23);
            return rawQuoteData[key1][key2];
        }, true);

        var translatorComponents = fluid.queryIoCSelector(that, "gpii.i18nComparison.translator", true);
        fluid.each(translatorComponents, function (translatorComponent) {
            var startTime = Date.now();
            fluid.log("Demonstrating component '" + translatorComponent.typeName + "'...");

            fluid.log("Language data (by locale)...");
            fluid.each(locales, function (locale) {
                fluid.log("'", locale, "' = ", translatorComponent.translate("static", {}, locale));
            });
            fluid.log(Date.now() - startTime, " total milliseconds elapsed...");

            fluid.log("Language data (by language)...");
            fluid.each(languages, function (language) {
                fluid.log("'", language, "' = ", translatorComponent.translate("static", {}, language));
            });
            fluid.log(Date.now() - startTime, " total milliseconds elapsed...");

            fluid.log("Variable interpolation...");
            fluid.each(quoteData, function (quote, index) {
                var generatedText = translatorComponent.translate("variable", { quote: quote }, "en_US");
                if (index === 0) {
                    fluid.log(generatedText);
                }
            });
            fluid.log(Date.now() - startTime, " total milliseconds elapsed...");
        });
    };

    fluid.defaults("gpii.i18nComparison.demo", {
        gradeNames: ["fluid.component"],
        components: {
            infusion: {
                type: "gpii.i18nComparison.infusion"
            },
            i18next: {
                type: "gpii.i18nComparison.i18next"
            }
        },
        listeners: {
            "onCreate.demoAll": {
                funcName: "gpii.i18nComparison.demo.demoAll",
                args: ["{that}"]
            }
        }
    });

    gpii.i18nComparison.demo();
})();

