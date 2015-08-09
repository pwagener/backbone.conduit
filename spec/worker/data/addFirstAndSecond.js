'use strict';

/**
 * This module provides a basic mapping function used in tests.
 */

module.exports = {
    name: 'addFirstAndSecond',
    method: function(item) {
        return {
            id: item.id,
            third: item.first + item.second
        }
    }
};