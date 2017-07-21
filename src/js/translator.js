/*

    The standard "harness" that each candidate-specific grade must implement, so that they can be called interchangeably
    in our tests.

 */
/* globals require */
(function () {
    "use strict";
    var fluid = fluid || require("infusion");
    fluid.defaults("gpii.i18nComparison.translator", {
        gradeNames: ["fluid.component"],
        invokers: {
            "translate": {
                funcName: "fluid.notImplemented",
                args:     ["{arguments}.0", "{arguments}.1", "{arguments}.2"] // messageKey, variableContent, locale
            }
        }
    });
})();
