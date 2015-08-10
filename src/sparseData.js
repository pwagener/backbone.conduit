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
 * Create the worker immediately.
 * @return {Promise} A promise that resolves once the worker has been created.
 */
function createWorkerNow() {
    _ensureBoss.call(this);
    return this._boss.createWorkerNow();
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
        arguments: [ items ]
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

    var idKey = context.model.idAttribute;
    var bossPromise = context._boss.makePromise({
        method: method,
        arguments: [
            {
                data: data,
                idKey: idKey
            }
        ]
    });

    return bossPromise.then(function(length) {
        context.length = length;
    });
}


function refill(data) {
    return _fillOrRefillOnWorker(data, { context: this, method: 'setData' });
}

function fill(data) {
    return _fillOrRefillOnWorker(data, { context: this, method: 'mergeData'});
}

function haul(options) {
    options = options || {};
    _ensureBoss.call(this);

    var url = _.result(this, 'url');
    var loadOptions = _.extend({
        url: url
    }, options);

    var self = this;
    return this._boss.makePromise({
        method: 'load',
        arguments: [ loadOptions ]
    }).then(function(length) {
        self.length = length;
        if (options.success) {
            options.success(this, null, options);
        }

        self.trigger('sync', self)
    }).catch(function(err) {
        // Call any error handler
        if (options.error) {
            options.error(err);
        }
    });
}

/**
 * Any sort/filter/map that has been applied to this collection alters the
 * data that is exposed from the worker thread.  To "go back", you reset the projection
 * back to the original data.
 * @return {Promise} A promise that resolves when the projection has been reset.
 */
function resetProjection() {
    _ensureBoss.call(this);
    return this._boss.makePromise({
        method: 'resetProjection'
    });
}

/**
 * Method to sort the data asynchronously.  This reorders the data available
 * on the worker.  If successful, it removes any models on the UI thread that
 * were previously prepared.
 *
 * Like a regular Backbone.Collection, this uses the value of 'this.comparator' to
 * specify the sorting. It can be overridden with the method parameter.
 *
 * In either case the value should be an object with:
 *   - property (required) The name of the property to sort by
 *   - direction (optional) The direction to sort in.  Defaults to ascending; to
 *     sort descending set this to 'desc'.
 * == OR ==
 *   - method (required) A string naming the ConduitWorker handler method to use to evaluate the item.
 *
 * @return {Promise} A promise that resolves when the sorting is completed.
 */
function sortAsync(sortSpec) {
    _ensureBoss.call(this);
    var self = this;

    sortSpec = sortSpec || this.comparator;

    // Error if comparator isn't provided correctly.
    if (!sortSpec || (!sortSpec.property && !sortSpec.method)) {
        return when.reject(new Error('Please provide a sort specification'));
    }

    return this._boss.makePromise({
        method: 'sortBy',
        arguments: [ sortSpec ]
    }).then(function() {
        // Sort was successful; remove any local models.
        // NOTE:  we could work around doing this by just re-preparing the
        // models we have locally ...
        self.models = [];
        self.trigger('sort');
    });
}

/**
 * Method to filter the data asynchronously. This filters the data available on
 * the worker.  If successful, it remove any models on the UI thread that were
 * previously prepared.
 *
 * To make this method easy to chain, a filter can be specified either as
 * 'this.filterEvaluator' OR as the argument to this method.  In either case the
 * filterEvaluator should:
 *   - An object showing the set of properties to match, similar to underscore's
 *     '_.where(...)' functionality
 * == OR ==
 *   - An object with "method" specifying the name of the method to evaluate each
 *     item in the collection, similar to underscore's '_.find(...)' functionality
 *
 * @param filterEvaluator (Optional) the filter evaluator to use in lieu of the
 * one specified as 'this.filterEvaluator'.
 * @return {*}
 */
function filterAsync(filterEvaluator) {
    _ensureBoss.call(this);
    var self = this;

    filterEvaluator = filterEvaluator || this.filterEvaluator;

    if (!filterEvaluator) {
        return when.reject(new Error('Please provide a filter specification'));
    }

    return this._boss.makePromise({
        method: 'filter',
        arguments: [ filterEvaluator ]
    }).then(function(length) {
        self.length = length;
        self.models = [];
        self.trigger('filter');
    });
}

/**
 * Map the data in the worker into a different set of data.
 *
 * To make this easy to chain, you may specify the mapping function either as
 * 'this.mapSpec' OR as an argument to this method.  The argument will override any
 * value provided on the instance.  It must include:
 *   - mapper: The name of the function to use when mapping data
 *
 * When this method completes, any models stored locally on the main thread will be
 * removed and must be re-fetched from the worker via the 'prepare(...)' method.
 *
 * @param mapSpec Optionally specify the mapping you want to use in lieu of what is
 * provided in 'this.mapSpec'.
 * @return {Promise} A Promise that resolves when the map has completed.
 */
function mapAsync(mapSpec) {
    _ensureBoss.call(this);

    var self = this;
    mapSpec = mapSpec || this.mapSpec;

    return this._boss.makePromise({
        method: 'map',
        arguments: [ mapSpec.mapper ]
    }).then(function() {
        self.models = [];
        self.trigger('map');
    });
}

/**
 * Run a reduction on the data in the worker.
 *
 * @param reduceSpec Must specify the reduction function as 'reduceSpec.reducer'.  It also may specify the object to
 * use as the 'memo' in as 'reduceSpec.memo'.  Note, however, that after the reduce has completed the passed-in object
 * _will not_ be modified.  Instead, the result will be provided by the returned promise.
 * @return {Promise} A Promise that resolves to the result of the reduction.
 */
function reduceAsync(reduceSpec) {
    _ensureBoss.call(this);

    return this._boss.makePromise({
        method: 'reduce',
        arguments: [ reduceSpec ]
    });
}

function _ensureBoss() {
    if (!this._boss) {

        var components = [
            './conduit.worker.data.js'
        ];

        var extras = config.getComponents();
        _.each(extras, function(component) {
            components.push(component);
        });

        this._boss = new Boss({
            Worker: config.getWorkerConstructor(),
            fileLocation: config.getWorkerPath(),
            autoTerminate: false,

            // Use the Backbone.Conduit config for the debug configuration
            debug: config.getDebug(),
            worker: {
                debug: config.getWorkerDebug(),

                // Include the Conduit components we will leverage
                components: components
            }
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

    // Override 'haul' so the data request & processing happens on the worker
    haul: haul,

    _sparseSet: _sparseSet,

    /*
        The public sparseData interface:
     */
    createWorkerNow: createWorkerNow,

    prepare: prepare,

    isPrepared: isPrepared,

    resetProjection: resetProjection,

    sortAsync: sortAsync,

    filterAsync: filterAsync,

    mapAsync: mapAsync,

    reduceAsync: reduceAsync
};


// ====== Machinery to ensure we reliably throw errors on many/most Collection methods ======

// Methods to fail with a general message
var notSupportMethods = [
    // Underscore methods
    'forEach', 'each', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'detect', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample', 'partition',

    // Underscore attribute methods
    'groupBy', 'countBy', 'indexBy',

    // Other various methods
    "slice", "pluck", "parse", "clone", "create"

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
    { called: 'fetch', use: 'haul' },

    { called: 'sort', use: 'sortAsync' },
    { called: 'sortBy', use: 'sortAsync' },

    { called: 'filter', use: 'filterAsync' },
    { called: 'find', use: 'filterAsync' },
    { called: 'where', use: 'filterAsync' },
    { called: 'findWhere', use: 'filterAsync' },

    { called: 'map', use: 'mapAsync' }
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

        // Mix in sparseData behavior
        _.extend(Collection.prototype, mixinObj);

        return Collection;
    }
};