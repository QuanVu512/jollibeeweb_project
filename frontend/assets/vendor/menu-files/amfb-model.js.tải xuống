/**
 * Facebook pixel model
 * @api
 */

define([
    'ko',
    'domReady!'
], function (ko) {
    'use strict';

    var actions = ko.observable(null),
        isLogEnabled = ko.observable(false),
        logEventUrl = null;

    window.fbq = window.fbq || [];

    return {
        actions: actions,
        logEventUrl:logEventUrl,
        isLogEnabled: isLogEnabled,

        /**
         * Get logging config data
         * @param {Boolean} isEnabled
         */
        setIsLogEnabled: function (isEnabled) {
            isLogEnabled(isEnabled)
        },

        /**
         * Set logging URL
         * @param {String} url
         */
        setLogEventUrl: function (url) {
            logEventUrl = url;
        },

        /**
         * Get logging URL
         * @returns {Sting|null}
         */
        getLogEventUrl: function () {
            return logEventUrl;
        }
    };
});
