'use strict';

var Backbone = require('backbone');

var fill = require('./fill');
var Collection = require('./Collection');

Backbone.Conduit = module.exports = {
    Promise: function () {
        throw new TypeError('An ES6-compliant Promise implementation must be provided');
    },

    fill: fill,

    Collection: Collection
};
