'use strict';

/**
 * This module provides the utility methods for managing data on the worker.
 * Typically shared amongst several core worker modules. The data is added
 * and retrieved through a "context", which is identified with a key. That
 * way, the worker can handle data for multiple "contexts", which are primarily
 * the sparse collections (identified by a unique object id). So if you have
 * multiple sparse collections using the same worker thread, their data does
 * not have to interfere with one another.
 *
 * Much of the logic here is in managing the quick lookup collections (i.e. _byId)
 * that allow us to not constantly iterate over the whole set.
 */

var _ = require('underscore');
var managedContext = require('../managedContext');

// The "TopContext" will just be the ConduitWorker object
function _getTopContext() {
    var topLevelContext = _getTopContextAsIs();

    if (!topLevelContext._contexts) {
        // We haven't been initialized yet
        topLevelContext._contexts = {}; // support multiple contexts
        topLevelContext._cachedDataMap = {};
    }

    return _getTopContextAsIs();
}

function _getTopContextAsIs() {
    return ConduitWorker;
}

function _getContextForKey(key) {
    var topLevelContext = _getTopContext();
    var context = topLevelContext._contexts[key];
    if (!context) {
        context = topLevelContext._contexts[key] = {
            _key: key
        };
        _initStoreForContext(context);
    }
    return context;
}

function _getRawDataForKey(key) {
    return _getContextForKey(key)._data;
}

function _reapplyAllProjections(context) {
    context._projectedData = _getRawDataForKey(context._key);
    _.each(context._projections, function(projection) {
        context._projectedData = projection(context._projectedData);
    });
}

function _getDataForContext(context) {
    return context._projectedData;
}

function _rebuildIdsAndIndexes(context) {
    var data = _getDataForContext(context);

    context._byId = {};
    var index = 0;
    _.each(data, function(item) {
        if (item !== void 0 && item !== null) {
            var id = item[context._idKey];
            if (id !== void 0) {
                context._byId[id] = item;
            }
            item._dataIndex = index;

            if (context.writeable &&  item._conduitId === void 0) {
                // An item created in a 'map' projection needs a ConduitID
                item._conduitId = _.uniqueId('conduit');
            }
        }
        index++;
    });
}

function _resetProjectionForContext(context) {
    context._projectedData = _getRawDataForKey(context._key);
    context._projections = [];
    _rebuildIdsAndIndexes(context);
}

function _initStoreForContext(context, options) {
    options = options || {};
    var data;
 
    if (options.reset || !context._data) {
        data = [];
        context._data = data;
        // if there is a cache key for this data, we set
        // the data as the cached data.
        if (options.cacheKey) {
            _setCacheData(options.cacheKey, data);
            context._cacheKey = options.cacheKey;
        }
        context._projectedData = {};
        context._idKey = options.idKey || 'id';
        context._byId = {};
        _resetProjectionForContext(context);
    }

    if (context._idKey && options.idKey && (context._idKey != options.idKey)) {
        throw new Error('Cannot change the ID key of existing data');
    }
}

// Methods for the context data utility object

function _getContext() {
    return _getContextForKey(this._contextKey);
}

function initStore(options) {
    return _initStoreForContext(this._getContext(), options);
}

function getData() {
    return _getDataForContext(this._getContext());
}

function getIdKey() {
    var context = this._getContext();
    return context._idKey;
}

function applyProjection(toApply) {
    var context = this._getContext();
    context._projections.push(toApply);

    context._projectedData = toApply(this.getData());
    _rebuildIdsAndIndexes(context);
}

function resetProjection() {
    _resetProjectionForContext(this._getContext());
}

function getCachedData(cacheKey) {
    var topContext = _getTopContext();
    var cached = topContext._cachedDataMap[cacheKey];
    // make sure that two objects are not using
    // the same dataset
    return cached ? cached.slice(0) : null;
}

function setCachedData(cacheKey, data) {
    var topContext = _getTopContext();
    topContext._cachedDataMap[cacheKey] = data;
}

function removeCachedData(cacheKey) {
    var topContext = _getTopContext();
    delete topContext._cachedDataMap[cacheKey];
}

function addTo(data, options) {
    options = options || {};
    var context = this._getContext();
    var existingRawData = _getRawDataForKey(this._contextKey);

    data = data || [];

    if (!_.isArray(data)) {
        throw new Error('"addTo" requires data in an array');
    }

    var byId = context._byId;
    var idKey = context._idKey;
    _.each(data, function(item) {
        if (item !== null && item !== void 0) {
            var id = item[idKey];
            var existing;
            if (id !== void 0) {
                existing = byId[id];
            }
            if (existing) {
                if (options.replace) {
                    // Replace item properties
                    var existingIndex = existingRawData.indexOf(existing);
                    if (existingIndex !== void 0) {
                        existingRawData[existingIndex] = item;
                    }

                    existingIndex = context._projectedData.indexOf(existing);
                    if (existingIndex !== void 0) {
                        context._projectedData[existingIndex] = item;
                    }

                    item._conduitId = existing._conduitId;
                } else {
                    // Merge item properties
                    _.extend(existing, item);
                }
            } else {
                // Add the brand new element.  Note that '_dataIndex' and '_conduitId' will be
                // calculated after projections are applied
                existingRawData.push(item);
            }
        } else {
            // Add the null or undefined item regardless
            existingRawData.push(item);
        }
    });

    // If we had any projections applied, we must re-apply them in order
    _reapplyAllProjections(context);

    // We also rebuild the _byId map and recalculate the _dataIndex properties
    _rebuildIdsAndIndexes(context);

    managedContext.debug('Added ' + data.length + ' items.  Total length: ' + existingRawData.length);
}

function removeById(id) {
    var context = this._getContext();
    var entireData = _getRawDataForKey(context._key);

    var item = context._byId[id];
    if (item !== void 0  && item !== null) {
        var index = entireData.indexOf(item);
        if (index >= 0) {
            entireData.splice(index, 1);
            _reapplyAllProjections(context);
            _rebuildIdsAndIndexes(context);
        }
    }
}

function findById(id) {
    var context = this._getContext();
    return context._byId[id];
}

function findByIds(idArray) {
    var matches = [];

    var context = this._getContext();
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
    var data = this.getData();
    return data[index];
}

function findByIndexes(indexes) {
    var found = [];
    var allData = this.getData();
    for (var i = indexes.min; i < indexes.max; i++) {
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
    var data = this.getData();
    return data.length;
}

module.exports = function (contextKey) {
    
    if (!contextKey) {
        throw new Error('Must provide a context "key" to be able to read and write data');
    }
 
    return {
        
        _contextKey: contextKey,
        
        _getContext: _getContext,

        initStore: initStore,

        /**
         * Get the current view of the data we are exposing.  If the data has not been
         * sorted/filtered/mapped, then this is the full, original data set.  Otherwise,
         * this is the version of the data that has gone through those projections.
         *
         * Note for performance reasons, this is a reference to the internally-stored array.
         * You should not modify it directly.
         */
        getData: getData,

        /**
         * Retrieve the in-use ID key for this data set
         */
        getIdKey: getIdKey,

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

        /**
         * Remove data from the existing data set that matches the given ID.
         */
        removeById: removeById,

        findById: findById,

        findByIds: findByIds,

        findByIndex: findByIndex,

        findByIndexes: findByIndexes,

        parseData: parseData,
        
        getCachedData: getCachedData,
        
        setCachedData: setCachedData,
        
        removeCachedData: removeCachedData,

        length: length
    };
        
};
