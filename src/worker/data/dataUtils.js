'use strict';

/**
 * This module provides the utility methods for managing data on the worker.
 * Typically shared amongst several core worker modules.
 *
 * Much of the logic here is in managing the quick lookup collections (i.e. _byId)
 * that allow us to not constantly iterate over the whole set.
 */

var _ = require('underscore');
var managedContext = require('../managedContext');

function _getContext(skipInit) {
    if (!ConduitWorker._data && !skipInit) {
        // We haven't been initialized yet
        initStore();
    }

    return ConduitWorker;
}

function initStore(options) {
    var context = _getContext(true);
    options = options || {};

    if (options.reset || !context._data) {
        context._data = [];
        context._idKey = options.idKey || 'id';
        context._byId = {};
        resetProjection();
    }

    if (context._idKey && options.idKey && (context._idKey != options.idKey)) {
        throw new Error('Cannot change the ID key of existing data');
    }
}

function getData() {
    var context = _getContext();
    return context._projectedData;
}

function _rebuildIdsAndIndexes() {
    var data = getData();
    var context = _getContext();

    var byId = context._byId = {};
    var idKey = context._idKey;
    var index = 0;
    _.each(data, function(item) {
        if (item !== null && item !== undefined) {
            var id = item[idKey];
            if (id !== void 0) {
                byId[id] = item;
            }
            item._dataIndex = index;

            if (typeof item._conduitId === 'undefined') {
                // An item created in a 'map' projection needs a ConduitID
                item._conduitId = _.uniqueId('conduit');
            }
        }
        index++;
    });
}

function applyProjection(toApply) {
    var context = _getContext();

    context._projectedData = toApply(getData());
    _rebuildIdsAndIndexes();

    context._projections.push(toApply);
}

function resetProjection() {
    var context = _getContext();
    context._projectedData = context._data;
    context._projections = [];
}

function addTo(data, options) {
    options = options || {};
    var context = _getContext();

    data = data || [];
    if (!_.isArray(data)) {
        throw new Error('"addTo" requires data in an array');
    }

    var byId = context._byId;
    var idKey = context._idKey;
    _.each(data, function(item) {
        if (item !== null && item !== undefined) {
            var id = item[idKey];
            var existing;
            if (id !== void 0) {
                existing = byId[id];
            }
            if (existing) {
                if (options.replace) {
                    // Replace item properties
                    byId[id] = item;
                    var existingIndex = context._data.indexOf(existing);
                    item._conduitId = existing._conduitId;
                    context._data[existingIndex] = item;
                } else {
                    // Merge item properties
                    _.extend(existing, item);
                }
            } else {
                // Brand new element or overwriting
                if (id) {
                    byId[id] = item;
                }

                // Add a conduit ID for tracking this item on both sides of the wall
                item._conduitId = _.uniqueId('conduit');

                // Add the brand new element.  Note that '_dataIndex' will be
                // calculated after the projections are applied
                context._data.push(item);
            }
        } else {
            // Add the null or undefined item regardless
            context._data.push(item);
        }
    });

    // If we had any projections applied, we must re-apply them in-order, then re-index all the data.
    _.each(context._projections, function(projection) {
        context._projectedData = projection(context._data);
    });
    _rebuildIdsAndIndexes();

    managedContext.debug('Added ' + data.length + ' items.  Total length: ' + context._data.length);
}

function findById(id) {
    var context = _getContext();
    return context._byId[id];
}

function findByIds(idArray) {
    var matches = [];

    var context = _getContext();
    for (var i = 0; i < idArray.length; i++) {
        var match = context._byId[idArray[i]];
        if (_.isUndefined(match)) {
            matches.push(null);
        } else {
            matches.push(match);
        }
    }

    return matches;
}

function findByIndex(index) {
    var data = getData();
    return data[index];
}

function findByIndexes(indexes) {
    var found = [];
    var allData = getData();
    for (var i = indexes.min; i <= indexes.max; i++) {
        var data = allData[i];
        if (!_.isUndefined(data)) {
            found.push(data);
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
    var data = getData();
    return data.length;
}

module.exports = {

    initStore: initStore,

    /**
     * Get the current view of the data we are exposing.  If the data has not been
     * sorted/filtered/mapped, then this is the full, original data set.  Otherwise,
     * this is the version of the data that has gone through those projections.
     */
    getData: getData,

    /**
     * Apply a given function to the data.
     * @param toApply The function that will receive the full data set, and should return the projected data
     * set.
     */
    applyProjection: applyProjection,

    /**
     * Remove any projections.  After calling this, then 'getCurrentData' will return
     * the original data set.
     */
    resetProjection: resetProjection,

    /**
     * Add data to the existing data set.  Note that if any projections have been applied, they will be re-applied
     * in-order after the addition.
     */
    addTo: addTo,

    findById: findById,

    findByIds: findByIds,

    findByIndex: findByIndex,

    findByIndexes: findByIndexes,

    parseData: parseData,

    length: length
};