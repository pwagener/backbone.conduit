'use strict';

/**
 * This module provides the utility methods for managing data on the worker.
 * Typically shared amongst several core worker modules.
 *
 * Much of the logic here is in managing the quick lookup collections (i.e. _byId)
 * that allow us to not constantly iterate over the whole set.
 */

var _ = require('underscore');

function _getContext() {
    return ConduitWorker;
}

function initStore(options) {
    var context = _getContext();
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

// TODO:  get rid of this
function _isInitialized(context) {
    return _.isArray(context.data);
}

function addTo(data) {
    var context = _getContext();

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

function findById(id) {
    var context = _getContext();
    if (_isInitialized(context)) {
        return context._byId[id];
    }
}

function findByIds(idArray) {
    var matches = [];

    var context = _getContext();
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

function findByIndex(index) {
    var context = _getContext();
    if (_isInitialized(context)) {
        return context.data[index];
    }
}

function findByIndexes(indexes) {
    var found = [];
    var context = _getContext();
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

        if (!_.isArray(data)) {
            throw new Error('Data provided as a string should represent an array');
        }
    }

    if (data && !_.isArray(data)) {
        throw new Error('Data should be an array or a JSON string representing an array');
    }

    return data;
}

function length() {
    var context = _getContext();
    return context.data.length;
}

module.exports = {

    initStore: initStore,

    addTo: addTo,

    findById: findById,

    findByIds: findByIds,

    findByIndex: findByIndex,

    findByIndexes: findByIndexes,

    parseData: parseData,

    length: length
};