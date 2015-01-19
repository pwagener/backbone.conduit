'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var shortCircuit = require('./shortCircuit');

function fill(models, options) {
    // TODO:  um, implement me
}

var mixinObj = {
    fill: fill
};

module.exports = {
    mixin: function(Collection) {
        _.extend(Collection.prototype, mixinObj);
        return Collection;
    }
};