'use strict';

/**
 * This module provides the utility methods for managing data on the worker.
 * Typically shared amongst several core worker modules.
 *
 * Much of the logic here is in managing the quick lookup collections (i.e. _byId)
 * that allow us to not constantly iterate over the whole set.
 */

var _ = require('underscore');

/**
 * Different browsers treat the global context of a worker differently.  This
 * method will return the context that we should store our data in.
 * @param context
 */
function getDataContext(context) {
    if (!context) {
        context = this || global;
    }

    if (!context) {
        throw new Error('Cannot determine worker context');
    }

    return context;
}

function initStore(context, options) {
    options = options || {};

    if (options.reset || !context.data) {
        context.data = [];
        context._idKey = options.idKey || 'id';
        context._byId = {};
    }

    if (context._idKey && options.idKey && (context._idKey != options.idKey)) {
        throw new Error('Cannot change the ID key of existing data');
    }
}

function _isInitialized(context) {
    return _.isArray(context.data);
}

function addTo(context, data) {
    data = data || [];

    var byId = context._byId;
    var idKey = context._idKey;
    _.each(data, function(item) {
        var id = item[idKey];
        var existing = byId[id];
        if (existing) {
            // Must merge item properties
            var keys = _.keys(item);
            _.each(keys, function(key) {
                existing[key] = item[key];
            });
        } else {
            // Brand new element or overwriting
            if (id) {
                byId[id] = item;
            }

            // Add the index where the data exists
            item._dataIndex = context.data.push(item) - 1;
        }
    });
}

function findById(context, id) {
    if (_isInitialized(context)) {
        return context._byId[id];
    }
}

function findByIds(context, idArray) {
    var matches = [];

    if (_isInitialized(context)) {
        for (var i = 0; i < idArray.length; i++) {
            var match = context._byId[idArray[i]];
            if (!_.isUndefined(match)) {
                matches.push(match);
            }
        }
    }

    return matches;
}

function findByIndex(context, index) {
    if (_isInitialized(context)) {
        return context.data[index];
    }
}

function findByIndexes(context, indexes) {
    var found = [];

    if (_isInitialized(context)) {
        for (var i = indexes.min; i <= indexes.max; i++) {
            var data = context.data[i];
            if (!_.isUndefined(data)) {
                found.push(data);
            }
        }
    }

    return found;
}


/**
 * 'setData' and 'mergeData' can both accept either an array of items, or a string of JSON.
 * @param data An array of data, or a string that can be JSON.parse-ed into an array.  If
 * neither of those are true, this throws an error.
 */
function parseData(data) {
    if (_.isString(data)) {
        data = JSON.parse(data);
    }

    if (!_.isArray(data)) {
        throw new Error('Data must be either an array or a JSON string representing an array');
    }

    return data;
}

module.exports = {

    getDataContext: getDataContext,

    initStore: initStore,

    addTo: addTo,

    findById: findById,

    findByIds: findByIds,

    findByIndex: findByIndex,

    findByIndexes: findByIndexes,

    parseData: parseData,

    length: function(context) {
        return context.data.length;
    }
};