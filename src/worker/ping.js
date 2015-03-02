'use strict';

/**
 * This module provides a method for the worker to respond to a "ping" method,
 * which responds with the timestamp of when it was called.
 */

module.exports = {
    name: 'ping',

    method: function(options) {
        return new Date().toUTCString();
    }
};