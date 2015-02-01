'use strict';
/**
 * This module provides configuration capabilities for the Backbone.Conduit components.
 * It is accessible externally via 'Conduit.config'
 */

var _ = require('underscore');
var _Conduit = require('./_Conduit');

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


function setUnderscorePath(path) {
    _Conduit.setUnderscorePath(path);
    setValue(underscorePathKey, path);
}

var underscorePathKey = 'underscoreJsPath';

module.exports = {
    setUnderscorePath: setUnderscorePath,
    getUnderscorePath: _.bind(getValue, this, underscorePathKey),
    ensureUnderscore: _.bind(ensureValue, this, underscorePathKey)
};