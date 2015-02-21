'use strict';
/**
 * This module provides configuration capabilities for the Backbone.Conduit components.
 * It is accessible externally via 'Conduit.config'
 */

var _ = require('underscore');
var _Worker = require('./_Worker');

var _values = {};

function setValue(key, value) {
    _values[key] = value;
}

function getValue(key) {
    return _values[key];
}

function ensureValue(key, module) {
    var value = getValue(key);

    if (_.isUndefined(value)) {
        var errStr = 'Conduit ';
        if (module) {
            errStr += 'module "' + module + '" ';
        }
        throw new Error(errStr + 'requires a configuration value for "' + key + '"');
    }
}

function isBrowserEnv() {
    return typeof document !== 'undefined';
}

function setUnderscorePath(path) {
    _Worker.setUnderscorePath(path);
    setValue(underscorePathKey, path);
}

var underscorePathKey = 'underscoreJsPath';

module.exports = {
    _values: _values,

    // Are we running in a browser environment?
    isBrowserEnv: isBrowserEnv,

    // Set the path to the available Underscore JS
    setUnderscorePath: setUnderscorePath,

    // Get the path to Underscore JS
    getUnderscorePath: _.bind(getValue, this, underscorePathKey),

    // Ensure Underscore JS path has been set.  Throws an exception otherwise.
    ensureUnderscore: _.bind(ensureValue, this, underscorePathKey)
};