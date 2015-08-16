'use strict';

/**
 * This module provides a basic reduction function used in tests.
 */

module.exports = {
    name: 'sumOfFirstAndSecondProperties',
    method: function(memo, item) {
        return memo + item.first + item.second;
    }
};