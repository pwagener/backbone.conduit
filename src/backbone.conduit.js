'use strict';

var Backbone = require('backbone');

var refill = require('./refill');
var Collection = require('./Collection');

Backbone.Conduit = module.exports = {
    Promise: function () {
        throw new TypeError('An ES6-compliant Promise implementation must be provided');
    },

    fill: refill,

    Collection: Collection
};
