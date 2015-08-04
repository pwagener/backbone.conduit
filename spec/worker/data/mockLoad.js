'use strict';

// This module provides a mock implementation of the 'load' module
// that can be used in testing.
var when = require('when');

module.exports = {
    name: 'load',

    method: function(options) {
        // TODO:  move this fixture data to its own file
        return when.resolve([
            {id: 2, name: "two", first: 0, second: 2},
            {id: 1, name: "one", first: 1, second: 0},
            {id: 3, name: "three", first: 1, second: 2}
        ].length);
    }
};