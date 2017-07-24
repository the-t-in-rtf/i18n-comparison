/* globals fluid, $, JSON5 */
(function (fluid, $, JSON5) {
    "use strict";
    fluid.setLogging(true);
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.tests.i18nComparison.demo.browser");

    gpii.tests.i18nComparison.demo.browser.loadMesssageBundle = function (that) {
        $.ajax("/tests/data/glass.json5", {
            success: that.handleMessageBundleResponse,
            failure: fluid.fail
        });
    };

    gpii.tests.i18nComparison.demo.browser.handleMessageBundleResponse = function (that, responseBody) {
        var data = JSON5.parse(responseBody);
        that.applier.change("messageBundle", data);
        that.events.onMessagesLoaded.fire();
    };

    gpii.tests.i18nComparison.demo.browser.loadQuotes = function (that) {
        $.ajax("/tests/data/prout.json5", {
            success: that.handleQuotesResponse,
            failure: fluid.fail
        });
    };

    gpii.tests.i18nComparison.demo.browser.handleQuotesResponse = function (that, responseBody) {
        var data = JSON5.parse(responseBody);
        that.applier.change("quotes", data);
        that.events.onQuotesLoaded.fire();
    };


    fluid.defaults("gpii.tests.i18nComparison.demo.browser", {
        gradeNames: ["gpii.i18nComparison.demo"],
        events: {
            onQuotesLoaded: null,
            onMessagesLoaded: null,
            onMessageBundleLoaded: {
                events: {
                    onQuotesLoaded: "onQuotesLoaded",
                    onMessagesLoaded: "onMessagesLoaded"
                }
            }
        },
        listeners: {
            "onCreate.loadMessageBundle": {
                funcName: "gpii.tests.i18nComparison.demo.browser.loadMesssageBundle",
                args: ["{that}"]
            },
            "onCreate.loadQuotes": {
                funcName: "gpii.tests.i18nComparison.demo.browser.loadQuotes",
                args: ["{that}"]
            }
        },
        invokers: {
            "handleMessageBundleResponse": {
                funcName: "gpii.tests.i18nComparison.demo.browser.handleMessageBundleResponse",
                args: ["{that}", "{arguments}.0"] // data, textStatus, jqXHR
            },
            "handleQuotesResponse": {
                funcName: "gpii.tests.i18nComparison.demo.browser.handleQuotesResponse",
                args: ["{that}", "{arguments}.0"] // data, textStatus, jqXHR
            }
        }
    });
    gpii.tests.i18nComparison.demo.browser();
})(fluid, jQuery, JSON5);
