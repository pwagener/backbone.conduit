'use strict';

/**
 * This worker method handler returns data from the worker.
 */

var _ = require('underscore');

var dataUtils = require('./dataUtils');

module.exports = {

    name: 'prepare',

    /**
     * Prepare to use the data in the main thread.  The data should already be
     * in the context of the method as 'this.data'; typically it will have been
     * placed there by using the 'setData' or 'mergeData' method.
     * @param options Should contain either:
     *   o id:  The single ID of the item
     *   o ids: An array of IDs to return
     *   o index: The index of the item
     *   o indexes: An object specifying 'min' and 'max' of indexes to return
     * @return {*} Either the single item or an array of items, depending how it
     * was called
     */
    method: function(options) {
        var found;

        if (!_.isUndefined(options.id)) {
            found = dataUtils.findById(options.id);
        } else if (_.isArray(options.ids)) {
            found = dataUtils.findByIds(options.ids);
        } else if (_.isNumber(options.index)) {
            found = dataUtils.findByIndex(options.index);
        } else if (_.isObject(options.indexes)) {
            found = dataUtils.findByIndexes(options.indexes);
        }

        return found;
    }
};