'use strict';

// This module provides a mock implementation of the 'load' module
// that can be used in testing.

module.exports = {
    name: 'restGet',

    method: function(options) {
        // TODO:  move this fixture data to its own file
        var responseData = [
            {id: 2, name: "two", first: 0, second: 2},
            {id: 1, name: "one", first: 1, second: 0},
            {id: 3, name: "three", first: 1, second: 2}
        ];
        return Promise.resolve({
            length: responseData.length,
            context: undefined
        });
    }
};