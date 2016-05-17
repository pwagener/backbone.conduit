(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("backbone"), require("underscore"));
	else if(typeof define === 'function' && define.amd)
		define(["backbone", "underscore"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("backbone"), require("underscore")) : factory(root["Backbone"], root["_"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_9__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Backbone = __webpack_require__(1);

	var config = __webpack_require__(2);
	var fill = __webpack_require__(3);
	var refill = __webpack_require__(4);
	var haul = __webpack_require__(5);
	var sparseData = __webpack_require__(6);

	var QuickCollection = __webpack_require__(7);
	var SparseCollection = __webpack_require__(8);

	Backbone.Conduit = module.exports = {
	    config: config,

	    fill: fill,
	    refill: refill,
	    haul: haul,
	    sparseData: sparseData,

	    QuickCollection: QuickCollection,
	    SparseCollection: SparseCollection
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	/**
	 * This module provides configuration capabilities for the Backbone.Conduit components.
	 * It is accessible externally via 'Conduit.config'
	 */

	var _ = __webpack_require__(9);

	var workerProbe = __webpack_require__(10);

	var _values = {};

	var workerFileName = 'backbone.conduit-worker.js';
	var workerPathKey = 'workerPath';

	var workerConstructorKey = 'WorkerConstructor';

	function setValue(key, value) {
	    _values[key] = value;
	}

	function getValue(key) {
	    return _values[key];
	}

	function ensureValue(key, module) {
	    var value = getValue(key);

	    if (_.isUndefined(value)) {
	        var errStr = 'Conduit ';
	        if (module) {
	            errStr += 'module "' + module + '" ';
	        }
	        throw new Error(errStr + 'requires a configuration value for "' + key + '"');
	    }
	}

	function isBrowserEnv() {
	    return typeof document !== 'undefined';
	}

	/**
	 * If no path is specified to find our worker, try some reasonable places
	 */
	function findDefaultWorkerPath() {

	    /*
	        It's worth exploring how we could find the "current" script and assume
	        that directory might contain the worker too.  Something like:
	    */
	    //var scripts = document.querySelectorAll('script[src]');
	    //var currentScript = scripts[ scripts.length - 1 ].src;
	    //var currentScriptChunks = currentScript.split('/');
	    //var currentScriptFile = currentScriptChunks[currentScriptChunks.length - 1];
	    //var directory = currentScript.replace(currentScriptFile, '');

	    return [
	        // Absolutes
	        '/bower_components/backbone.conduit/dist',
	        '/javascript/lib/backbone.conduit/dist',

	        // Relatives
	        'bower_components/backbone.conduit/dist',
	        'javascript/lib/backbone.conduit/dist'
	    ];
	}

	function enableWorker(options) {
	    options = options || {};

	    var WorkerConstructor = options.Worker ? options.Worker : Worker;
	    setValue(workerConstructorKey, WorkerConstructor);

	    var debug = options.debug;
	    setValue('debug', debug);

	    var paths = options.paths || findDefaultWorkerPath();

	    if (_.isString(paths)) {
	        paths = [ paths ];
	    }
	    var searchOptions = {
	        Worker: WorkerConstructor,
	        fileName: workerFileName,
	        paths: paths,
	        debug: debug
	    };

	    return workerProbe.searchPaths(searchOptions).then(function(foundPath) {
	        setValue(workerPathKey, foundPath);
	        setValue('workerDebug', options.workerDebug);
	        setValue('components', options.components);
	    }).catch(function() {
	        throw new Error('Did not find worker file in ' + paths);
	    });
	}

	function isWorkerEnabled() {
	    return !!getValue(workerPathKey) && !!getValue(workerConstructorKey);
	}

	function disableWorker() {
	    setValue(workerPathKey, null);
	}

	function getWorkerPath() {
	    ensureValue(workerPathKey);
	    return getValue(workerPathKey);
	}

	function getWorkerConstructor() {
	    ensureValue(workerConstructorKey);
	    return getValue(workerConstructorKey);
	}

	module.exports = {
	    _values: _values,

	    /**
	     * Determine if we are running in a browser-like environment.
	     */
	    isBrowserEnv: isBrowserEnv,

	    /**
	     * Determine if the Conduit Worker is currently enabled.  This will be false until
	     * a call to 'enableWorker' resolves successfully.
	     */
	    isWorkerEnabled: isWorkerEnabled,

	    /**
	     * Enable the Conduit Worker.  This does not create a worker immediately; rather, it
	     * will ensure we can find the worker file.
	     * @param options.  Optional arguments.  May include:
	     *   o paths:  String or array listing directories to search for the worker.
	     *       Defaults to looking in some common locations
	     *   o Worker:  The Worker constructor to use.  Typically will be
	     *        'window.Worker' in production code.
	     *   o debug: Print details to the console about where we look for the worker and
	     *        where it is finally loaded from.  Defaults to 'false'.
	     * @return A Promise that is resolved once the worker file has been found, meaning
	     *   the worker-centric Conduit functions are available for use.  The promise will
	     *   be rejected if we cannot find the worker file or cannot construct the worker.
	     */
	    enableWorker: enableWorker,

	    /**
	     * If you ever need to turn off the worker, call this.  Shouldn't be necessary
	     * in regular code, but helpful in testing.
	     */
	    disableWorker: disableWorker,

	    /**
	     * Get the path to the worker file.  This is typically not needed by external
	     * applications.  Note this will throw an error if 'isWorkerEnabled' returns
	     * false.
	     */
	    getWorkerPath: getWorkerPath,

	    /**
	     * Get the constructor to use to create a Worker.  This is not typically needed
	     * by applications.  Note this will throw an error if 'isWorkerEnabled' returns
	     * false.
	     */
	    getWorkerConstructor: getWorkerConstructor,

	    getDebug: function() {
	        return getValue('debug');
	    },

	    getWorkerDebug: function() {
	        return getValue('workerDebug');
	    },

	    getComponents: function() {
	        return getValue('components');
	    }
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(9);
	var Backbone = __webpack_require__(1);
	var shortCircuit = __webpack_require__(11);

	function fill(models, options) {
	    // Create the short-circuit
	    shortCircuit.setup(this);

	    // Silence any add/change/remove events
	    options = options ? _.clone(options) : {};
	    var requestedEvents = !options.silent;
	    options.silent = true;

	    // Call set
	    var result = this.set(models, options);

	    // Trigger the other event
	    this.trigger('fill', this, result);

	    // Clean up
	    shortCircuit.teardown(this);

	    // Return the result
	    return result;
	}

	var mixinObj = {
	    fill: fill
	};

	module.exports = {
	    mixin: function(Collection) {
	        _.extend(Collection.prototype, mixinObj);
	        return Collection;
	    }
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * This module provides a mixin for a Backbone.Collection to provide a method,
	 * 'fill(...)' that can be used as a performant replacement for
	 * 'Collection.reset(...)' in some circumstances.
	 */

	var _ = __webpack_require__(9);
	var Backbone = __webpack_require__(1);
	var shortCircuit = __webpack_require__(11);

	/**
	 * Implementation of the refill function as an alternative to Backbone.Collection.reset
	 */
	function refill(models, options) {

	    // Short-circuit this collection
	    shortCircuit.setup(this);

	    // Call reset
	    var result = this.reset(models, options);

	    // Clean up
	    shortCircuit.teardown(this);

	    // Return the result
	    return result;
	}

	// The object that will be added to any prototype when mixing this
	// module.
	var mixinObj = {
	    refill: refill
	};


	module.exports = {
	    mixin: function(Collection) {
	        _.extend(Collection.prototype, mixinObj );
	        return Collection;
	    }
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(9);
	var Backbone = __webpack_require__(1);

	var config = __webpack_require__(2);
	var fill = __webpack_require__(3);
	var refill = __webpack_require__(4);

	/**
	 * This utility method is taken from backbone.js verbatim
	 */
	var wrapError = function(model, options) {
	    var error = options.error;
	    options.error = function(resp) {
	        if (error) error(model, resp, options);
	        model.trigger('error', model, resp, options);
	    };
	};

	/**
	 * This method is called when the 'haul' method has successfully received data.  It is broken out and mixed into
	 * the collection so that other modules (i.e. 'sparseData') have a good place to hook into.
	 * @param response The response
	 * @param options The options that were originally provided to 'haul'
	 * @param origSuccessCallback The original callback on success
	 * @private
	 */
	var _onHaulSuccess = function(response, options, origSuccessCallback) {
	    // This is key change from 'fetch':  use refill/fill instead of reset/set
	    var method = options.reset ? 'refill' : 'fill';
	    this[method](response, options);
	    if (origSuccessCallback) origSuccessCallback(this, response, options);
	    this.trigger('sync', this, response, options);
	};

	/**
	 * This method is a replacement for Backbone.Collection.fetch that will use
	 * Conduit.QuickCollection.fill/refill instead of Backbone.Collection.set/reset when data
	 * is successfully returned from the server.
	 */
	function haul(options) {
	    options = options ? _.clone(options) : {};
	    if (options.parse === void 0) options.parse = true;
	    var success = options.success;
	    var collection = this;
	    options.success = function(resp) {
	        collection._onHaulSuccess(resp, options, success);
	    };
	    wrapError(this, options);
	    return this.sync('read', this, options);
	}

	var mixinObj = {
	    haul: haul,

	    _onHaulSuccess: _onHaulSuccess
	};

	module.exports = {
	    mixin: function(Collection) {
	        if (!_.isFunction(Collection.prototype.refill)) {
	            refill.mixin(Collection);
	        }

	        if (!_.isFunction(Collection.prototype.fill)) {
	            fill.mixin(Collection);
	        }

	        _.extend(Collection.prototype, mixinObj);
	        return Collection;
	    }
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * This module provides the ability for a Collection to manage its data sparsely.  Data lives on the Worker thread,
	 * not the main one.
	 */

	var _ = __webpack_require__(9);
	var Backbone = __webpack_require__(1);

	var config = __webpack_require__(2);
	var Boss = __webpack_require__(12);

	var refillModule = __webpack_require__(4);
	var fillModule = __webpack_require__(3);

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
	 * Terminate the worker immediately.  The SparseCollection worker is intentionally
	 * configured to never terminate automatically, since it holds the canonical copy of
	 * the data. However, if you have finished processing the data and have populated all the
	 * models you need, stopping the worker will conserve resources.
	 */
	function stopWorkerNow() {
	    _ensureBoss.call(this);
	    this._boss.terminate();
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
	        args: [ items ]
	    }).then(function(rawData) {
	        var converted = self._sparseSet(rawData);

	        // Listen to any changes on the models to do auto synchronization
	        _.each(converted, function(model) {
	            self.listenTo(model, 'change', self._updateDataInWorker);
	        });
	// TODO:  what if we prepare the same model twice?  The listener of the initial one is then lost ... ?
	        self.trigger('prepared', converted);
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
	        for (var index = items.indexes.min; index < items.indexes.max; index++) {
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
	        // TODO:  add _conduitId and _dataIndex as properties on the model object
	    }

	    // NOTE:  we don't sort *or* fire any events

	    // Return the added (or merged) model (or models).
	    return singular ? models[0] : models;
	}

	/**
	 * Method that overrides Collection.add for sparse data
	 * @param models A model or array of models
	 * @param options Other options.
	 * TODO:  handle the add-at-index option, others.
	 * @private
	 */
	function addAsync(models, options) {
	    _ensureDirtyTracking.call(this);

	    if (!_.isArray(models)) {
	        models = [ models ];
	    }

	    // Put the data into the worker
	    var self = this;
	    var promise = this.fill(models)
	        .then(function() {
	            // Remove our promise from the list of outstanding ones
	            self._noLongerDirty(dirtyId);
	        });

	    // Keep track of this as an outstanding promise
	    var dirtyId = this._trackAsDirty(promise, models);
	    return promise;
	}

	function _fillOrRefillOnWorker(data, options) {
	    var method = options.method;

	    var context = options.context;
	    _ensureBoss.call(context);

	    var idKey = context.model.idAttribute;
	    var bossPromise = context._boss.makePromise({
	        method: method,
	        args: [
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
	    var postFetchTransform = _.result(this, 'postFetchTransform');
	    var getOptions = _.extend({
	        url: url,
	        postFetchTransform: postFetchTransform
	    }, options);

	    var self = this;
	    return this._boss.makePromise({
	        method: 'restGet',
	        args: [ getOptions ]
	    }).then(function(result) {
	        self.length = result.length;
	        if (options.success) {
	            options.success(this, null, options);
	        }

	        self.trigger('sync', self);

	        // If there was a context returned, resolve to it.  Otherwise resolve to
	        // nothing
	        if (result.context) {
	            return result.context;
	        }
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

	    // ToDeprecate at the release of 0.7.X
	    if (!sortSpec && this.comparator) {
	        console.log('Warning: defining the sort specification as "collection.comparator" will be removed in the next release.  Use "collection.sortSpec" instead.');
	        this.sortSpec = this.comparator;
	    }
	    sortSpec = sortSpec || this.sortSpec;

	    // ToDeprecate at the release of 0.7.X
	    if (sortSpec && sortSpec.evaluator) {
	        console.log('Warning: defining the sort method with "evaluator" will be removed in the next release.  Use { method: "someMethod" } instead.');
	        sortSpec.method = sortSpec.evaluator;
	    }

	    // Error if comparator isn't provided correctly.
	    if (!sortSpec || (!sortSpec.property && !sortSpec.method)) {
	        return Promise.reject(new Error('Please provide a sort specification'));
	    }

	    return this._boss.makePromise({
	        method: 'sortBy',
	        args: [ sortSpec ]
	    }).then(function(result) {
	        // Sort was successful; remove any local models.
	        // NOTE:  we could work around doing this by just re-preparing the
	        // models we have locally ...
	        _resetPreparedModels.call(self);
	        self.trigger('sortAsync');
	        return result.context;
	    });
	}

	function _resetPreparedModels() {
	    this.models = [];
	    this._byId = {};
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
	 * @param filterSpec (Optional) the filter evaluator to use in lieu of the
	 * one specified as 'this.filterEvaluator'.
	 * @return {*}
	 */
	function filterAsync(filterSpec) {
	    _ensureBoss.call(this);
	    var self = this;

	    filterSpec = filterSpec || this.filterSpec;

	    if (!filterSpec) {
	        return Promise.reject(new Error('Please provide a filter specification'));
	    }

	    // ToDeprecate at the release of 0.7.X
	    if (filterSpec.evaluator) {
	        console.log('Warning: defining the filter method with "evaluator" will be removed in the next release.  Use { method: "someMethod" } instead.');
	        filterSpec.method = filterSpec.evaluator;
	    }

	    return this._boss.makePromise({
	        method: 'filter',
	        args: [ filterSpec ]
	    }).then(function(result) {
	        self.length = result.length;
	        _resetPreparedModels.call(self);
	        self.trigger('filterAsync');

	        return result.context;
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

	    // ToDeprecate in 0.7.X
	    if (_.isString(mapSpec)) {
	        console.log('Warning: providing the "mapSpec" method name as a string will be removed in the next version; use { method: "someMethod" } instead');
	        mapSpec = { method: mapSpec };
	    }
	    if (_.isString(mapSpec.mapper)) {
	        console.log('Warning: providing the mapping method as "mapper" will be removed in the next version; use { method: "someMethod" } instead');
	        mapSpec.method = mapSpec.mapper;
	    }

	    return this._boss.makePromise({
	        method: 'map',
	        args: [ mapSpec ]
	    }).then(function(result) {
	        _resetPreparedModels.call(self);
	        self.trigger('mapAsync');
	        return result.context;
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

	    // ToDeprecate in 0.7.X
	    if (_.isString(reduceSpec.reducer)) {
	        console.log('Warning: providing the reduce method as "reducer" will be removed in the next version; use { method: "someMethod" } instead');
	        reduceSpec.method = reduceSpec.reducer;
	    }

	    return this._boss.makePromise({
	        method: 'reduce',
	        args: [ reduceSpec ]
	    });
	}


	/**
	 * Ensure this instance has the ability to track dirty models & sync processes
	 * @private
	 */
	function _ensureDirtyTracking() {
	    if (!this._dirty) {
	        this._dirty = {
	            inProgress: {}
	        };
	    }
	}

	function hasDirtyData() {
	    _ensureDirtyTracking.call(this);
	    var dirtyIds = _.keys(this._dirty.inProgress);
	    return dirtyIds.length > 0;
	}

	function _updateDataInWorker(model, options) {
	    var config = this.conduit;
	    if (!config || !config.writeable) {
	        // This collection was not created as a writeable one.
	        if (!config || !config.suppressWriteableWarning) {
	            console.log('Warning: model is read-only, sparse collection modified (cid: ' + model.cid + ')');
	            console.log('The modified data will not be propagated to the worker');
	        }
	        return;
	    }

	    // TODO:  if we unset values in the model, do those changes propagate to the
	    // worker successfully?
	    _ensureBoss.call(this);
	    var dataToMerge = model.toJSON();

	    // Rather than a regular merge, we should fully replace the attributes
	    // in the worker.
	    var mergeOptions = {
	        replace: true
	    };

	    var self = this;
	    var promise = this._boss.makePromise({
	        method: 'mergeData',
	        args: [
	            { data: [ dataToMerge ], options: mergeOptions }
	        ]
	    }).then(function() {
	        self._noLongerDirty(dirtyHandle);
	    });

	    var dirtyHandle = this._trackAsDirty(promise, model);
	    return promise;
	}

	function _trackAsDirty(promise, dirtyObj) {
	    _ensureDirtyTracking.call(this);

	    var dirtyId = _.uniqueId('dirty');
	    this._dirty.inProgress[dirtyId] = {
	        promise: promise,
	        target: dirtyObj
	    };

	    return dirtyId;
	}

	function _noLongerDirty(dirtyId) {
	    var inProgress = this._dirty.inProgress;
	    var dirty = inProgress[dirtyId];
	    if (dirty) {
	        // TODO:  should we inspect the promise to see if it's resolved?
	        delete inProgress[dirtyId];
	        this.trigger('sweepComplete', dirty.target);
	    }
	}

	function cleanDirtyData() {
	    _ensureDirtyTracking.call(this);
	    var syncsInProgress = _.values(this._dirty.inProgress);
	    var promises = _.pluck(syncsInProgress, 'promise');
	    return Promise.all(promises);
	}

	function _ensureBoss() {
	    if (!this._boss) {
	        // TODO: This is untestable as written w/o growing the scope of the spec to fully configured a worker.

	        // Components that Backbone.Conduit needs
	        var components = [
	            './conduit.worker.data.js'
	        ];

	        // Components specified in the base Conduit configuration, plus
	        // components specified for this Collection type

	        // ToDeprecate:  Remove after 0.7.X
	        if (this.conduitComponents) {
	            console.log('Warning:  specifying Conduit components as "conduitComponents" will be removed in the next release.  Use "conduit: { components: [...] }" instead."');
	            this.conduit = this.conduit || {};
	            this.conduit.components = this.conduitComponents;
	        }
	        components = _.compact(_.union(components, config.getComponents(), _.result(this.conduit, 'components')));

	        this._boss = new Boss({
	            Worker: config.getWorkerConstructor(),
	            fileLocation: config.getWorkerPath(),

	            // We never want the worker for this collection to terminate, as it holds all our data!
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

	    // Override fill/refill to put the data on the worker instead of in the main thread
	    refill: refill,
	    fill: fill,

	    // Override haul so data request & processing happens on the worker
	    haul: haul,

	    // The sparse-friendly implementation of Collection.set(), which we call from 'prepare'
	    _sparseSet: _sparseSet,

	    _updateDataInWorker: _updateDataInWorker,
	    _trackAsDirty: _trackAsDirty,
	    _noLongerDirty: _noLongerDirty,

	    /*
	        The public sparseData interface:
	     */
	    createWorkerNow: createWorkerNow,

	    stopWorkerNow: stopWorkerNow,

	    prepare: prepare,

	    isPrepared: isPrepared,

	    resetProjection: resetProjection,

	    sortAsync: sortAsync,

	    filterAsync: filterAsync,

	    mapAsync: mapAsync,

	    reduceAsync: reduceAsync,

	    /**
	     * Work In Progress here:  helping with data changes in models
	     */
	    hasDirtyData: hasDirtyData,

	    cleanDirtyData: cleanDirtyData,

	    addAsync: addAsync
	};

	// This object is mixed in if the Backbone version is less than 1.1.1
	var bb111MixinObj = {
	    _addReference: function(model) {
	        this._byId[model.cid] = model;
	        var id = this.modelId(model.attributes);
	        if (id != null) this._byId[id] = model;
	        model.on('all', this._onModelEvent, this);
	    }
	};

	// This object is mixed in if the Backbone version is less than 1.2.0
	var bb120MixinObj = {
	    // Define how to uniquely identify models in the collection.
	    modelId: function (attrs) {
	        return attrs[this.model.prototype.idAttribute || 'id'];
	    }
	};


	// ====== Machinery to ensure we reliably throw errors on many/most Collection methods ======

	// Methods to fail with a general message
	var notSupportMethods = [
	    // Underscore methods
	    'forEach', 'each', 'collect', 'reduceRight', 'foldr', 'detect', 'select',
	    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
	    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
	    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
	    'lastIndexOf', 'isEmpty', 'chain', 'sample', 'partition',

	    // Underscore attribute methods
	    'groupBy', 'countBy', 'indexBy',

	    // Other various methods
	    'slice', 'pluck', 'clone', 'create'

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
	        throw new Error('Cannot call "' + method + '".  Sparse collections should use addAsync/removeAsync.');
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

	    { called: 'map', use: 'mapAsync' },

	    { called: 'reduce', use: 'reduceAsync' },
	    { called: 'foldl', use: 'reduceAsync' },
	    { called: 'inject', use: 'reduceAsync' },

	    { called: 'parse', use: 'Collection.postFetchTransform' },

	    { called: 'add', use: 'addAsync' },
	    { called: 'remove', use: 'removeAsync' }

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

	        if (_.contains(['1.0.0', '1.1.0'], Backbone.VERSION)) {
	            _.extend(Collection.prototype, bb111MixinObj);
	        }

	        if (_.contains(['1.0.0', '1.1.0', '1.1.1', '1.1.2'], Backbone.VERSION)) {
	            _.extend(Collection.prototype, bb120MixinObj);
	        }

	        return Collection;
	    }
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * This module provides an out-of-the-box Collection implementation that leverages the
	 * Conduit capabilities to deal with large amounts of data.
	 */

	var Backbone = __webpack_require__(1);
	var _ = __webpack_require__(9);

	var fill = __webpack_require__(3);
	var refill = __webpack_require__(4);
	var haul = __webpack_require__(5);

	// Act like a Backbone.Collection, but use 'refill'
	var Collection = function(models, options) {
	    options || (options = {});
	    if (options.model) this.model = options.model;
	    if (options.comparator !== void 0) this.comparator = options.comparator;
	    this._reset();
	    this.initialize.apply(this, arguments);

	    // Difference from Backbone:  use 'refill' instead of 'reset'
	    if (models) {
	        this.refill(models, _.extend({silent: true}, options));
	    }
	};
	_.extend(Collection.prototype, Backbone.Collection.prototype);
	Collection.extend = Backbone.Collection.extend;

	// Add all the relevant modules to the new Collection type
	fill.mixin(Collection);
	refill.mixin(Collection);
	haul.mixin(Collection);

	module.exports = Collection;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	/**
	 * This module provides the SparseCollection, a Backbone.Collection implementation
	 * that has the Conduit.sparseData module already mixed into it.
	 */
	var Backbone = __webpack_require__(1);
	var sparseData = __webpack_require__(6);

	var SparseCollection = Backbone.Collection.extend({});
	sparseData.mixin(SparseCollection);

	module.exports = SparseCollection;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_9__;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * This module attempts to load the worker file from a variety of paths
	 */

	var _ = __webpack_require__(9);

	var Boss = __webpack_require__(12);

	/**
	 * Creates a promise that will attempt to find the worker at a specific
	 * location.
	 * @return A promise that will be resolved either with nothing (i.e. the worker
	 * was not found), or will resolve with the path (i.e. a functional worker was
	 * found).  The promise is never rejected, allowing it to be used in 'Promise.all(...)'
	 * and similar structures.
	 * @private
	 */
	function _createProbePromise(Worker, path, fileName, debugSet) {
	    var debug;
	    if (debugSet) {
	        debug = function(msg) {
	            console.log(msg)
	        }
	    } else {
	        debug = function() { }
	    }

	    var fullPath = path + '/' + fileName;
	    debug('Probing for worker at "' + fullPath + '"');
	    var boss = new Boss({
	        Worker: Worker,
	        fileLocation: fullPath
	    });

	    //noinspection JSUnresolvedFunction
	    return new Promise(function(resolve) {
	        try {
	            boss.makePromise({
	                method: 'ping',
	                autoTerminate: true,
	                args: [
	                    { debug: debugSet }
	                ]
	            }).then(function(response) {
	                // Ping succeeded.  We found a functional worker
	                debug('Located worker at "' + fullPath + '" at "' + response + '"');
	                resolve(fullPath);
	            }).catch(function(err) {
	                // Worker loaded, but ping error (yikes)
	                debug('Worker at "' + fullPath + '" did not respond.  Error: ' + err);
	                resolve();
	            });
	        } catch (err) {
	            debug('Failed to load worker at "' + fullPath + "'");
	            resolve();
	        }
	    });
	}

	function searchPaths(options) {
	    options = options || {};

	    var paths = options.paths;
	    if (!_.isArray(paths)) {
	        throw new Error('"searchPaths" requires "paths" in the options');
	    }

	    var fileName = options.fileName;
	    if (!_.isString(fileName)) {
	        throw new Error('"searchPaths" requires "fileName" in the options');
	    }

	    var Worker = options.Worker;
	    // Note: checking _.isFunction(Worker) does not work in iOS Safari/Chrome
	    if (_.isUndefined(Worker)) {
	        throw new Error('"searchPaths" requires "Worker" in the options');
	    }

	    var probePromises = [];
	    _.each(paths, function(path) {
	        var probePromise = _createProbePromise(options.Worker, path, fileName, options.debug);
	        probePromises.push(probePromise);
	    });

	    //noinspection JSUnresolvedFunction
	    return new Promise(function(resolve, reject) {
	        Promise.all(probePromises).then(function(results) {
	            // Find the first result that returned a string path.
	            var found;
	            for (var i = 0; i < results.length; i++) {
	                if (results[i]) {
	                    found = results[i];
	                    break;
	                }
	            }

	            if (found) {
	                resolve(found);
	            } else {
	                reject();
	            }
	        });
	    });
	}

	module.exports = {

	    /**
	     * Search a collection of paths to see if we can find a functional worker.
	     * @param global The global environment to use.
	     * @param options All other options.  Must include:
	     *    o Worker: The constructor for a Worker object
	     *    o paths:  The array of paths to search
	     *    o fileName: The name of the worker file to try to load
	     * @return A Promise that is resolved with the path to the worker, or rejected
	     * if a functioning worker cannot be found.
	     */
	    searchPaths: searchPaths

	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * This module is shared between 'fill' and 'refill' as where the short-circuit method
	 * implementations live.
	 */
	var _ = __webpack_require__(9);
	var Backbone = __webpack_require__(1);


	/**
	 * This function is swapped into a Backbone.Model's prototype when models are going to be
	 * added to a collection in order to not do unnecessary work.
	 */
	function quickModelSet(key, val) {
	    // Just assign the attribute & move on.
	    var attrs, current;
	    if (key == null) return this;

	    // Handle both `"key", value` and `{key: value}` -style arguments.
	    if (typeof key === 'object') {
	        attrs = key;
	    } else {
	        (attrs = {})[key] = val;
	    }

	    // Check for changes of `id`.
	    if (this.idAttribute in attrs) {
	        this.id = attrs[this.idAttribute];
	    }

	    // NOTE:  no validation, un-setting, _previousAttributes updating
	    current = this.attributes;
	    for (var attr in attrs) {
	        // NOTE:  no changes detection & event triggering

	        //noinspection JSUnfilteredForInLoop
	        val = attrs[attr];

	        //noinspection JSUnfilteredForInLoop
	        current[attr] = val;
	    }

	    return this;
	}

	/**
	 * This function is used in place of the Backbone.Collection.set(...).
	 * @param models
	 * @param options
	 * @returns {*}
	 */
	function quickCollectionSet(models, options) {
	    // Force no-sort up front
	    options = options || {};
	    var needsSort = options.sort;
	    var sortable = this.comparator && (options.at == null) && options.sort !== false;
	    if (sortable) {
	        options.sort = false;
	    }

	    var returnedModels = this._originalCollectionSet(models, options);

	    // Handle sorting after we have set everything
	    if (needsSort && sortable && _.isArray(returnedModels)) {
	        this.sort();
	        returnedModels = _.clone(this.models);
	    }

	    return returnedModels;
	}

	/**
	 * This will create a Constructor suitable for a short-circuited creation that looks & acts like OriginalModel
	 * @param OriginalModel The model whose behavior to mimic
	 */
	function generateConduitModel(OriginalModel) {
	    var defaults = _.result(OriginalModel.prototype, 'defaults');

	    var ConduitModel = function(attributes, options) {
	        var attrs = attributes || {};
	        options || (options = {});
	        //noinspection JSUnusedGlobalSymbols
	        this.cid = _.uniqueId('c');
	        this.attributes = {};
	        if (options.collection) this.collection = options.collection;
	        if (options.parse) attrs = this.parse(attrs, options) || {};

	        // Significant change from Backbone.Model: only do defaults if necessary
	        if (defaults) {
	            attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
	        }

	        // Second significant change from Backbone.Model: use quickModelSet in place of a regular set
	        quickModelSet.apply(this, [attrs, options]);

	        //noinspection JSUnusedGlobalSymbols
	        this.changed = {};
	        this.initialize.apply(this, arguments);
	    };

	    // Build the prototype for the Model, overriding any 'set' behavior, and finding all the Backbone-y prototype
	    // methods we can find.  Note that we include the Backbone.Model.prototype here so that any call to
	    // "... instanceof Backbone.Model" will return true.
	    ConduitModel.prototype = new Backbone.Model();
	    _.extend(ConduitModel.prototype,
	        OriginalModel.prototype,
	        OriginalModel.__super__
	    );

	    return ConduitModel;
	}

	/**
	 * Set up a short-circuit for adding models to a given collection
	 * @param collection The collection instance to short-circuit
	 * @return A collection of original functions that were moved by the shortCircuit, which can be provided to 'teardown'
	 * to reverse the process.
	 */
	function setup(collection) {
	    // Store the original model & generate a short-circuited one
	    collection._originalModel = collection.model;
	    collection.model = generateConduitModel(collection.model);

	    // Re-assign the Backbone.Collection.set method
	    collection._originalCollectionSet = collection.set;
	    collection.set = quickCollectionSet;

	    // Return the short-circuited collection
	    return collection;
	}

	/**
	 * Method to tear down a previously-created short circuit
	 * @param collection The short-circuited collection
	 */
	function teardown(collection) {
	    collection.set = collection._originalCollectionSet;
	    collection.model = collection._originalModel;

	    delete collection._originalCollectionSet;
	    delete collection._originalModel;
	}

	module.exports = {
	    setup: setup,
	    teardown: teardown
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(9);

	/**
	 * This object provides an interface to a worker that communicates via promises.
	 * Still conflicted about whether this should be an external module or not
	 * @param options which includes:
	 *   o fileLocation (required):  The location of the Worker JS file to load
	 *   o Worker (required): The Worker constructor to use.  Typically will be window.Worker
	 *     unless writing tests
	 *   o autoTerminate (optional):  If boolean false, the worker will never be terminated.  If boolean true,
	 *     the worker will be terminated immediately.  If a number, the worker will be terminated after that many
	 *     milliseconds.  Note that the worker will always be recreated when necessary (i.e. when calling
	 *     <code>boss.makePromise(...)</code>.  This defaults to 1000, meaning a worker will be terminated if it is not
	 *     used for one second.
	 * @constructor
	 */
	function Boss(options) {
	    this.initialize(options);
	}

	Boss.prototype = {
	    initialize: function(options) {
	        options = options || {};

	        this.WorkerFileLocation = options.fileLocation;
	        if (!this.WorkerFileLocation) {
	            throw new Error("You must provide 'fileLocation'");
	        }

	        this.WorkerConstructor = options.Worker;
	        if (!this.WorkerConstructor) {
	            throw new Error("You must provide 'Worker'");
	        }

	        // Default to one second
	        this.autoTerminate = _.isUndefined(options.autoTerminate) ? 1000 : options.autoTerminate;

	        // The configuration we will provide to any new worker
	        this.debug = options.debug;
	        this.workerConfig = _.extend({}, options.worker);

	        this._requestsInFlight = {};
	    },

	    /**
	     * This method can be called to preemptive-ly create the worker.  The worker is typically created automatically as
	     * needed, but if you want/need to create it ahead of time this will do so.  Note it will be created with whatever
	     * autoTerminate behavior you specified to the constructor (default 1 second).
	     * @return {Promise} A promise that resolves when the worker has been created.
	     */
	    createWorkerNow: function() {
	        return this._ensureWorker();
	    },

	    _scheduleTermination: function () {
	        if (this.autoTerminate === true) {
	            this.terminate();
	        } else if (this.autoTerminate && !this.terminateTimeoutHandle) {
	            // Set a timeout for how long this worker will stay available
	            // before we terminate it automatically
	            var callTerminate = _.bind(this.terminate, this);
	            this.terminateTimeoutHandle = setTimeout(callTerminate, this.autoTerminate);
	        }
	    },

	    /**
	     * Get a promise that will be resolved when the worker finishes
	     * @param details Details for the method call:
	     *   o method (required) The name of the method to call
	     *   o args (optional) The array of arguments that will be passed to the
	     *     worker method you are calling.
	     * @return A Promise that will be resolved or rejected based on calling
	     *   the method you are calling.
	     */
	    makePromise: function(details) {
	        if (!_.isString(details.method)) {
	            throw new Error("Must provide 'method'");
	        }

	        if (this.terminateTimeoutHandle) {
	            clearTimeout(this.terminateTimeoutHandle);
	            delete this.terminateTimeoutHandle;
	        }

	        var self = this;

	        return this._ensureWorker().then(function(worker) {
	            var requestId = _.uniqueId('cReq');

	            var requestDetails = _.extend({}, details, {
	                requestId: requestId
	            });

	            // Create the request.
	            self._requestsInFlight[requestId] = (function() {
	                var res = {};

	                res.promise = new Promise(function(resolve, reject) {
	                    res.resolve = resolve;
	                    res.reject = reject;
	                });

	                return res;
	            })();            

	            worker.postMessage(requestDetails);

	            return self._requestsInFlight[requestId].promise;
	        });
	    },

	    /**
	     * Method that is called in response to a worker message.
	     * @param event The worker event
	     * @private
	     */
	    _onWorkerMessage: function(event) {
	        var requestId = event.data.requestId;

	        var deferred = this._requestsInFlight[requestId];
	        if (deferred) {
	            var result = event.data.result;
	            if (result instanceof Error) {
	                // Reject if we get an error
	                deferred.reject(result);
	            } else {
	                deferred.resolve(result);
	            }
	        } else {
	            this._debug('Worker did not provide requestId: ' + event.data);
	        }

	        this._scheduleTermination();
	    },

	    /**
	     * Method that is called in response to a worker error.  This rejects all promises that are in-flight.
	     * @param err The error
	     * @private
	     */
	    _onWorkerError: function(err) {
	        this._debug('Worker call failed: ' + err.message);

	        _.each(_.keys(this._requestsInFlight), function(requestId) {
	            var deferred = this._requestsInFlight[requestId];

	            deferred.reject(new Error('Worker error: ' + err));
	        }, this);

	        this.terminate();
	    },

	    /**
	     * Explicitly terminate the managed worker, if it hasn't been terminated yet.
	     */
	    terminate: function() {
	        if(this.worker) {
	            this._debug('Terminating worker');
	            if (_.isFunction(this.worker.terminate)) {
	                this.worker.terminate();
	            }
	            this.worker = null;
	        }
	    },

	    /**
	     * Make sure our worker actually exists.  Create one if it does not with the correct
	     * configuration.
	     * @return A promise that resolves to the created worker.
	     * @private
	     */
	    _ensureWorker: function () {
	        var self = this;

	        var worker = this.worker;
	        if (!worker) {
	            // Note this will never throw an error; construction always succeeds
	            // regardless of whether the path is valid or not
	            self._debug('Creating new worker (autoTerminate: ' + self.autoTerminate + ')');
	            worker = self.worker = new self.WorkerConstructor(self.WorkerFileLocation);

	            worker.onmessage = _.bind(self._onWorkerMessage, self);
	            worker.onerror = _.bind(self._onWorkerError, self);

	            return self.makePromise({
	                method: 'configure',
	                args: [ self.workerConfig ]
	            }).then(function() {
	                return worker;
	            });
	        } else {
	            // Our worker is already ready.  Return a Promise that will resolve immediately.
	            return Promise.resolve(worker);
	        }
	    },

	    _debug: function(msg) {
	        if (this.debug) {
	            var currentdate = new Date();
	            var now = currentdate.getHours() + ":"
	                + currentdate.getMinutes() + ":"
	                + currentdate.getSeconds() + '-' + currentdate.getMilliseconds();

	            console.log(now + ' conduit.boss: ' + msg)
	        }
	    }
	};

	module.exports = Boss;


/***/ }
/******/ ])
});
