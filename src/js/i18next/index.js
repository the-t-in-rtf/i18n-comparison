/* globals require, fluid */
(function (fluid, window) {
    "use strict";
    fluid = fluid || require("infusion");
    var gpii  = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.i18nComparison.i18next");

    // TODO: This seems very wrong, refresh my memory about cross-environment loading.
    var i18next = window.i18next || require("i18next");
    gpii.i18nComparison.i18next.loadMessages = function (that) {
        var i18nextOptions = fluid.copy(that.options.i18nextOptions);
        i18nextOptions.resources = { "en": { default: { "variable": "As my father used to say: '{{quote}}'." } }};
        // Our sample data looks like:
        //
        // {
        //   "locale": "sa_IN",
        //   "language": "sa",
        //   "country": "IN",
        //   "title": "Sanskrit",
        //   "text": "काचं शक्नोम्यत्तुम् । नोपहिनस्ति माम् ॥"
        // },
        //
        // i18next expects resource bundles like:
        //
        // resources: {
        //   "sa-IN": { // language slash locale, note that the dashes are required
        //     translation: { // namespace
        //       "key": "काचं शक्नोम्यत्तुम् । नोपहिनस्ति माम् ॥" // message key and value
        //     }
        //   }
        // }
        //
        // I missed it several times, so I'll point it out explicitly.  The object is nested by language key, then by
        // namespace, then by message key.  I was assuming namespace, then language key, then message key.
        fluid.each(that.model.messageBundle, function (entry) {
            var locale = entry.locale.replace("_", "-");
            if (!i18nextOptions.resources[locale]) {
                i18nextOptions.resources[locale] = { default: {} };
            }
            i18nextOptions.resources[locale]["default"]["static"] = entry.text;

            // The first entry we hit becomes the default for the language.  Review the docs in more depth and see if there are cleaner approaches.
            if (!i18nextOptions.resources[entry.language]) {
                i18nextOptions.resources[entry.language] = { default: {} };
                i18nextOptions.resources[entry.language]["default"]["static"] = entry.text;
            }
        });

        i18next.init(i18nextOptions, function (err) {
            if (err) {
                fluid.fail(err);
            }
            else {
                that.events.onMessageBundleLoaded.fire();
            }
        });
    };

    gpii.i18nComparison.i18next.translate = function (that, messageKey, variableContent, locale) {
        var transformedLocale = locale.replace("_", "-");

        var langTranslator = i18next.getFixedT(transformedLocale);
        return langTranslator(messageKey, variableContent);
    };

    fluid.defaults("gpii.i18nComparison.i18next", {
        gradeNames: ["gpii.i18nComparison.translator"],
        members: {
            t: false
        },
        i18nextOptions: {
            fallbackLng: "en",
            ns: ["default"],
            defaultNS: "default"
            // debug: true
        },
        invokers: {
            "translate": {
                funcName: "gpii.i18nComparison.i18next.translate",
                args:     ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"] // messageKey, variableContent, locale
            }
        },
        modelListeners: {
            "messageBundle": {
                funcName: "gpii.i18nComparison.i18next.loadMessages",
                args:     ["{that}"]
            }
        }
    });
})(fluid, typeof window === "undefined" ? { i18next: false} : window);
