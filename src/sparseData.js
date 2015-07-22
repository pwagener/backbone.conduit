'use strict';

/**
 * This module provides the ability for a Collection to manage its data sparsely.  Data lives on the Worker thread,
 * not the main one.
 */

var _ = require('underscore');
var when = require('when');
var Backbone = require('backbone');

var config = require('./config');
var Boss = require('./Boss');

var refillModule = require('./refill');
var fillModule = require('./fill');
var haulModule = require('./haul');


function get(obj, options) {
    options = options || {};

    if (obj == null) return void 0;
    var id = obj.id || obj.cid || obj;

    if (options.skipCheck || this.isPrepared({ id: id })) {
        return this._byId[id];
    } else {
        throw new Error('Cannot get model by ID "' + id + '".  It has not been prepared.');
    }
}


function at(index) {
    var model = this.models[index];
    if (!model && index < this.length) {
        throw new Error('Cannot get model at index "' + index + '".  It has not been prepared');
    }

    return model;
}

/**
 * Implement the private interface of the 'haul' module to plug into the callback when the data is retrieved.
 * @param response The response
 * @param options The options that were originally provided to 'haul'
 * @param origSuccessCallback The original callback on success
 * @private
 */
function _onHaulSuccess(response, options, origSuccessCallback) {
    var method = options.reset ? 'refill' : 'fill';
    var self = this;
    this[method](response, options).then(function() {
        // TODO:  respect sorting

        if (origSuccessCallback) origSuccessCallback(self, response, options);
        self.trigger('sync', self, response, options);
    });
}


/**
 * This method is used to retrieve data from the worker and prepare to use it in the main
 * thread.
 * @param items Specify what to retrieve.  Possibilities:
 *   o id: The numerical ID to prepare
 *   o ids: An array of IDs to prepare
 *   o index:  The single index to prepare
 *   o indexes: An object with 'min' and 'max' to specify the indexes to return
 */
function prepare(items) {
    _ensureBoss.call(this);

    var self = this;
    return this._boss.makePromise({
        method: 'prepare',
        argument: items
    }).then(function(models) {
        var converted = self._sparseSet(models);
        return(converted);
    });
}

/**
 * Determine if a model or set of models is prepared in the main thread
 * @param items The same set of options available to `prepare(...)`
 */
function isPrepared(items) {
    if (!_.isUndefined(items.id)) {
        return !!this._byId[items.id];
    }

    if (_.isArray(items.ids)) {
        for (var id = 0; id < items.ids.length; id++) {
            var currentId = items.ids[id];
            if (!this._byId[currentId]) {
                return false;
            }
        }

        return true;
    }

    if (!_.isUndefined(items.index)) {
        return !!this.models[items.index];
    }

    if (!_.isUndefined(items.indexes)) {
        for (var index = items.indexes.min; index <= items.indexes.max; index++) {
            if (!this.models[index]) {
                return false;
            }
        }

        return true;
    }

    return false;
}

// Default Sparse Set options
var setOptions = {add: true, remove: true, merge: true};

/**
 * Function to create & store a Backbone.Model on the main thread.  This is
 * a simplified variant of Backbone.Collection.set(...).
 * @param models The array of raw data to translate into models
 * @param options Any options.  A special option is available here, _sparseSetAt, which
 * provides an array of indexes to add the items at.
 * @return Array An array of Backbone.Model instances in corresponding order as 'models'
 * @private  This should only be called by this module when creating & caching data from
 * the worker in the form of a model
 */
function _sparseSet(models, options) {
    options = _.defaults({}, options, setOptions);
    if (options.parse) models = this.parse(models, options);
    var singular = !_.isArray(models);
    models = singular ? (models ? [models] : []) : models.slice();
    var i, l, id, model, attrs, existing, sort;
    var at = options.at;
    var targetModel = this.model;
    var sortable = this.comparator && (at == null) && options.sort !== false;
    var sortAttr = _.isString(this.comparator) ? this.comparator : null;
    var toAdd = [], modelMap = {};
    var add = options.add, merge = options.merge, remove = options.remove;

    // Turn bare objects into model references, and prevent invalid models
    // from being added.
    for (i = 0, l = models.length; i < l; i++) {
        attrs = models[i];
        if (!attrs) {
            // We don't add empty models via sparseSet
            continue;
        }

        var itemIndex = attrs._dataIndex;
        if (_.isUndefined(itemIndex)) {
            throw new Error('Worker data did not provide _dataIndex');
        }

        delete attrs._dataIndex;
        id = attrs[targetModel.prototype.idAttribute || 'id'];

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        // TODO:  not much of a fan of 'skipCheck'....
        if (existing = this.get(id, { skipCheck: true })) {
            if (remove) {
                modelMap[existing.cid] = true;
            }
            if (merge) {
                attrs = attrs === model ? model.attributes : attrs;
                if (options.parse) attrs = existing.parse(attrs, options);
                existing.set(attrs, options);
                if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
            }
            models[i] = existing;

            // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {

            model = models[i] = this._prepareModel(attrs, options);
            if (!model) continue;
            toAdd.push(model);
            this._addReference(model, options);

            this.models[itemIndex] = model;
        }
    }

    // NOTE:  we don't sort *or* fire any events

    // Return the added (or merged) model (or models).
    return singular ? models[0] : models;
}


function _fillOrRefillOnWorker(data, options) {
    var method = options.method;

    var context = options.context;
    _ensureBoss.call(context);

    var dataWasString = _.isString(data);
    var idKey = context.model.idAttribute;
    var bossPromise = context._boss.makePromise({
        method: method,
        argument: {
            data: data,
            idKey: idKey
        }
    });

    return bossPromise.then(function(length) {
        context.length = length;
        if (dataWasString) {
            // Trigger an event to let anyone know our JSON has been parsed.
            // TODO:  this is nice for demo purposes, but anything else?
            context.trigger('jsonParsed');
        }
    });
}


function refill(data) {
    return _fillOrRefillOnWorker(data, { context: this, method: 'setData' });
}

function fill(data) {
    return _fillOrRefillOnWorker(data, { context: this, method: 'mergeData'});
}

function haul(options) {
    options = options ? _.clone(options) : {};

    // Install a specialized jQuery Ajax converter to *not* convert 'text json'.  We will
    // instead pass that directly to the worker, where it will be parsed.
    _.extend(options, {
        converters: {
            'text json': function(response) {
                return response;
            }
        }
    });

    // Use the original Conduit.haul implementation
    return this._conduitHaul(options);
}

/**
 * Method to sort the data asynchronously.  This permanently modifies the array
 * on the worker.  If successful, it removes any models on the UI thread that
 * were previously prepared.
 * @param sortSpec The sort specification.  Contains:
 *   - comparator (required) The name of the property to sort by
 *   - direction (optional) The direction to sort in.  Defaults to ascending; to
 *     sort descending set this to 'desc'.
 * @return {Promise} A promise that resolves when the sorting is completed.
 */
function sortAsync(sortSpec) {
    var self = this;
    return this._boss.makePromise({
        method: 'sortBy',
        argument: sortSpec
    }).then(function() {
        // Sort was successful; remove any local models.
        // NOTE:  we could work around doing this by just re-preparing the
        // models we have locally ...
        self.models = [];
        self.trigger('sort');
    });

}

function _ensureBoss() {
    if (!this._boss) {
        this._boss = new Boss({
            Worker: config.getWorkerConstructor(),
            fileLocation: config.getWorkerPath(),
            autoTerminate: false
        });
    }
}

var mixinObj = {
    // Override 'get' & 'at' to check to see if the data has been populated first
    get: get,
    at: at,

    // Override 'refill' and 'fill' to put the data on the worker instead of in the main thread
    refill: refill,
    fill: fill,

    // Override 'haul' to be able to pass the raw JSON string to the worker
    haul: haul,

    prepare: prepare,

    isPrepared: isPrepared,

    sortAsync: sortAsync,

    // This overrides the corresponding method from the 'haul' module to plug into the data return path
    _onHaulSuccess: _onHaulSuccess,

    _sparseSet: _sparseSet
};


// ====== Machinery to ensure we reliably throw errors on many/most Collection methods ======

// Methods to fail with a general message
var notSupportMethods = [
    // Underscore methods
    'forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample', 'partition',

    // Underscore attribute methods
    'groupBy', 'countBy', 'sortBy', 'indexBy',

    // Other various methods
    "slice", "sort", "pluck", "where", "findWhere", "parse", "clone", "create"

];
_.each(notSupportMethods, function(method) {
    mixinObj[method] = function() {
        throw new Error('Cannot call "' + method + '" on a collection with sparse data.');
    }
});

// Methods to fail with a "read only" message
var notSupportedWriteMethods = [
    "set", "add", "remove", "push", "pop", "unshift", "shift"
];
_.each(notSupportedWriteMethods, function(method) {
    mixinObj[method] = function() {
        throw new Error('Cannot call "' + method + '".  Collections with sparse data are read only.');
    }
});

// Methods that fail with a "use the Conduit replacement" message
var notSupportedConduitMethods = [
    { called: 'reset', use: 'refill' },
    { called: 'set', use: 'fill' },
    { called: 'fetch', use: 'haul' }
];
_.each(notSupportedConduitMethods, function(methodObj) {
    mixinObj[methodObj.called] = function() {
        throw new Error('Cannot call "' + methodObj.called + '".  Collections with sparse data must use "' + methodObj.use + '" instead.');
    }
});


module.exports = {
    mixin: function(Collection) {

        // Mix in our friends
        Collection = refillModule.mixin(Collection);
        Collection = fillModule.mixin(Collection);
        Collection = haulModule.mixin(Collection);

        // Keep a reference to original Conduit.haul
        Collection.prototype._conduitHaul = Collection.prototype.haul;

        // Mix in sparseData behavior
        _.extend(Collection.prototype, mixinObj);

        return Collection;
    }
};