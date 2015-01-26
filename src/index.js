'use strict';

var Backbone = require('backbone');

var fill = require('./fill');
var refill = require('./refill');
var Collection = require('./Collection');
var fetchJumbo = require('./fetchJumbo');

Backbone.Conduit = module.exports = {
    Promise: function () {
        throw new TypeError('An ES6-compliant Promise implementation must be provided');
    },

    fill: fill,
    refill: refill,
    fetchJumbo: fetchJumbo,
    Collection: Collection
};
