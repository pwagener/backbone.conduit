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
	var Promise = __webpack_require__(13).Promise;
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
	var Promise = __webpack_require__(13).Promise;

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
	var Promise = __webpack_require__(13).Promise;

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


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var require;var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process, global, module) {/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
	 * @version   3.2.1
	 */

	(function() {
	    "use strict";
	    function lib$es6$promise$utils$$objectOrFunction(x) {
	      return typeof x === 'function' || (typeof x === 'object' && x !== null);
	    }

	    function lib$es6$promise$utils$$isFunction(x) {
	      return typeof x === 'function';
	    }

	    function lib$es6$promise$utils$$isMaybeThenable(x) {
	      return typeof x === 'object' && x !== null;
	    }

	    var lib$es6$promise$utils$$_isArray;
	    if (!Array.isArray) {
	      lib$es6$promise$utils$$_isArray = function (x) {
	        return Object.prototype.toString.call(x) === '[object Array]';
	      };
	    } else {
	      lib$es6$promise$utils$$_isArray = Array.isArray;
	    }

	    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
	    var lib$es6$promise$asap$$len = 0;
	    var lib$es6$promise$asap$$vertxNext;
	    var lib$es6$promise$asap$$customSchedulerFn;

	    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
	      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
	      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
	      lib$es6$promise$asap$$len += 2;
	      if (lib$es6$promise$asap$$len === 2) {
	        // If len is 2, that means that we need to schedule an async flush.
	        // If additional callbacks are queued before the queue is flushed, they
	        // will be processed by this flush that we are scheduling.
	        if (lib$es6$promise$asap$$customSchedulerFn) {
	          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
	        } else {
	          lib$es6$promise$asap$$scheduleFlush();
	        }
	      }
	    }

	    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
	      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
	    }

	    function lib$es6$promise$asap$$setAsap(asapFn) {
	      lib$es6$promise$asap$$asap = asapFn;
	    }

	    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
	    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
	    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
	    var lib$es6$promise$asap$$isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

	    // test for web worker but not in IE10
	    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
	      typeof importScripts !== 'undefined' &&
	      typeof MessageChannel !== 'undefined';

	    // node
	    function lib$es6$promise$asap$$useNextTick() {
	      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	      // see https://github.com/cujojs/when/issues/410 for details
	      return function() {
	        process.nextTick(lib$es6$promise$asap$$flush);
	      };
	    }

	    // vertx
	    function lib$es6$promise$asap$$useVertxTimer() {
	      return function() {
	        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
	      };
	    }

	    function lib$es6$promise$asap$$useMutationObserver() {
	      var iterations = 0;
	      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
	      var node = document.createTextNode('');
	      observer.observe(node, { characterData: true });

	      return function() {
	        node.data = (iterations = ++iterations % 2);
	      };
	    }

	    // web worker
	    function lib$es6$promise$asap$$useMessageChannel() {
	      var channel = new MessageChannel();
	      channel.port1.onmessage = lib$es6$promise$asap$$flush;
	      return function () {
	        channel.port2.postMessage(0);
	      };
	    }

	    function lib$es6$promise$asap$$useSetTimeout() {
	      return function() {
	        setTimeout(lib$es6$promise$asap$$flush, 1);
	      };
	    }

	    var lib$es6$promise$asap$$queue = new Array(1000);
	    function lib$es6$promise$asap$$flush() {
	      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
	        var callback = lib$es6$promise$asap$$queue[i];
	        var arg = lib$es6$promise$asap$$queue[i+1];

	        callback(arg);

	        lib$es6$promise$asap$$queue[i] = undefined;
	        lib$es6$promise$asap$$queue[i+1] = undefined;
	      }

	      lib$es6$promise$asap$$len = 0;
	    }

	    function lib$es6$promise$asap$$attemptVertx() {
	      try {
	        var r = require;
	        var vertx = __webpack_require__(14);
	        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
	        return lib$es6$promise$asap$$useVertxTimer();
	      } catch(e) {
	        return lib$es6$promise$asap$$useSetTimeout();
	      }
	    }

	    var lib$es6$promise$asap$$scheduleFlush;
	    // Decide what async method to use to triggering processing of queued callbacks:
	    if (lib$es6$promise$asap$$isNode) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
	    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
	    } else if (lib$es6$promise$asap$$isWorker) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
	    } else if (lib$es6$promise$asap$$browserWindow === undefined && "function" === 'function') {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
	    } else {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
	    }
	    function lib$es6$promise$then$$then(onFulfillment, onRejection) {
	      var parent = this;

	      var child = new this.constructor(lib$es6$promise$$internal$$noop);

	      if (child[lib$es6$promise$$internal$$PROMISE_ID] === undefined) {
	        lib$es6$promise$$internal$$makePromise(child);
	      }

	      var state = parent._state;

	      if (state) {
	        var callback = arguments[state - 1];
	        lib$es6$promise$asap$$asap(function(){
	          lib$es6$promise$$internal$$invokeCallback(state, child, callback, parent._result);
	        });
	      } else {
	        lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
	      }

	      return child;
	    }
	    var lib$es6$promise$then$$default = lib$es6$promise$then$$then;
	    function lib$es6$promise$promise$resolve$$resolve(object) {
	      /*jshint validthis:true */
	      var Constructor = this;

	      if (object && typeof object === 'object' && object.constructor === Constructor) {
	        return object;
	      }

	      var promise = new Constructor(lib$es6$promise$$internal$$noop);
	      lib$es6$promise$$internal$$resolve(promise, object);
	      return promise;
	    }
	    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
	    var lib$es6$promise$$internal$$PROMISE_ID = Math.random().toString(36).substring(16);

	    function lib$es6$promise$$internal$$noop() {}

	    var lib$es6$promise$$internal$$PENDING   = void 0;
	    var lib$es6$promise$$internal$$FULFILLED = 1;
	    var lib$es6$promise$$internal$$REJECTED  = 2;

	    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

	    function lib$es6$promise$$internal$$selfFulfillment() {
	      return new TypeError("You cannot resolve a promise with itself");
	    }

	    function lib$es6$promise$$internal$$cannotReturnOwn() {
	      return new TypeError('A promises callback cannot return that same promise.');
	    }

	    function lib$es6$promise$$internal$$getThen(promise) {
	      try {
	        return promise.then;
	      } catch(error) {
	        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
	        return lib$es6$promise$$internal$$GET_THEN_ERROR;
	      }
	    }

	    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
	      try {
	        then.call(value, fulfillmentHandler, rejectionHandler);
	      } catch(e) {
	        return e;
	      }
	    }

	    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
	       lib$es6$promise$asap$$asap(function(promise) {
	        var sealed = false;
	        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
	          if (sealed) { return; }
	          sealed = true;
	          if (thenable !== value) {
	            lib$es6$promise$$internal$$resolve(promise, value);
	          } else {
	            lib$es6$promise$$internal$$fulfill(promise, value);
	          }
	        }, function(reason) {
	          if (sealed) { return; }
	          sealed = true;

	          lib$es6$promise$$internal$$reject(promise, reason);
	        }, 'Settle: ' + (promise._label || ' unknown promise'));

	        if (!sealed && error) {
	          sealed = true;
	          lib$es6$promise$$internal$$reject(promise, error);
	        }
	      }, promise);
	    }

	    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
	      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
	      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, thenable._result);
	      } else {
	        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
	          lib$es6$promise$$internal$$resolve(promise, value);
	        }, function(reason) {
	          lib$es6$promise$$internal$$reject(promise, reason);
	        });
	      }
	    }

	    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable, then) {
	      if (maybeThenable.constructor === promise.constructor &&
	          then === lib$es6$promise$then$$default &&
	          constructor.resolve === lib$es6$promise$promise$resolve$$default) {
	        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
	      } else {
	        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
	          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
	        } else if (then === undefined) {
	          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	        } else if (lib$es6$promise$utils$$isFunction(then)) {
	          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
	        } else {
	          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	        }
	      }
	    }

	    function lib$es6$promise$$internal$$resolve(promise, value) {
	      if (promise === value) {
	        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
	      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
	        lib$es6$promise$$internal$$handleMaybeThenable(promise, value, lib$es6$promise$$internal$$getThen(value));
	      } else {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      }
	    }

	    function lib$es6$promise$$internal$$publishRejection(promise) {
	      if (promise._onerror) {
	        promise._onerror(promise._result);
	      }

	      lib$es6$promise$$internal$$publish(promise);
	    }

	    function lib$es6$promise$$internal$$fulfill(promise, value) {
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

	      promise._result = value;
	      promise._state = lib$es6$promise$$internal$$FULFILLED;

	      if (promise._subscribers.length !== 0) {
	        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
	      }
	    }

	    function lib$es6$promise$$internal$$reject(promise, reason) {
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
	      promise._state = lib$es6$promise$$internal$$REJECTED;
	      promise._result = reason;

	      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
	    }

	    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
	      var subscribers = parent._subscribers;
	      var length = subscribers.length;

	      parent._onerror = null;

	      subscribers[length] = child;
	      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
	      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

	      if (length === 0 && parent._state) {
	        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
	      }
	    }

	    function lib$es6$promise$$internal$$publish(promise) {
	      var subscribers = promise._subscribers;
	      var settled = promise._state;

	      if (subscribers.length === 0) { return; }

	      var child, callback, detail = promise._result;

	      for (var i = 0; i < subscribers.length; i += 3) {
	        child = subscribers[i];
	        callback = subscribers[i + settled];

	        if (child) {
	          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
	        } else {
	          callback(detail);
	        }
	      }

	      promise._subscribers.length = 0;
	    }

	    function lib$es6$promise$$internal$$ErrorObject() {
	      this.error = null;
	    }

	    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

	    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
	      try {
	        return callback(detail);
	      } catch(e) {
	        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
	        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
	      }
	    }

	    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
	      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
	          value, error, succeeded, failed;

	      if (hasCallback) {
	        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

	        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
	          failed = true;
	          error = value.error;
	          value = null;
	        } else {
	          succeeded = true;
	        }

	        if (promise === value) {
	          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
	          return;
	        }

	      } else {
	        value = detail;
	        succeeded = true;
	      }

	      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
	        // noop
	      } else if (hasCallback && succeeded) {
	        lib$es6$promise$$internal$$resolve(promise, value);
	      } else if (failed) {
	        lib$es6$promise$$internal$$reject(promise, error);
	      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, value);
	      }
	    }

	    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
	      try {
	        resolver(function resolvePromise(value){
	          lib$es6$promise$$internal$$resolve(promise, value);
	        }, function rejectPromise(reason) {
	          lib$es6$promise$$internal$$reject(promise, reason);
	        });
	      } catch(e) {
	        lib$es6$promise$$internal$$reject(promise, e);
	      }
	    }

	    var lib$es6$promise$$internal$$id = 0;
	    function lib$es6$promise$$internal$$nextId() {
	      return lib$es6$promise$$internal$$id++;
	    }

	    function lib$es6$promise$$internal$$makePromise(promise) {
	      promise[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$id++;
	      promise._state = undefined;
	      promise._result = undefined;
	      promise._subscribers = [];
	    }

	    function lib$es6$promise$promise$all$$all(entries) {
	      return new lib$es6$promise$enumerator$$default(this, entries).promise;
	    }
	    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
	    function lib$es6$promise$promise$race$$race(entries) {
	      /*jshint validthis:true */
	      var Constructor = this;

	      if (!lib$es6$promise$utils$$isArray(entries)) {
	        return new Constructor(function(resolve, reject) {
	          reject(new TypeError('You must pass an array to race.'));
	        });
	      } else {
	        return new Constructor(function(resolve, reject) {
	          var length = entries.length;
	          for (var i = 0; i < length; i++) {
	            Constructor.resolve(entries[i]).then(resolve, reject);
	          }
	        });
	      }
	    }
	    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
	    function lib$es6$promise$promise$reject$$reject(reason) {
	      /*jshint validthis:true */
	      var Constructor = this;
	      var promise = new Constructor(lib$es6$promise$$internal$$noop);
	      lib$es6$promise$$internal$$reject(promise, reason);
	      return promise;
	    }
	    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;


	    function lib$es6$promise$promise$$needsResolver() {
	      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	    }

	    function lib$es6$promise$promise$$needsNew() {
	      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	    }

	    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
	    /**
	      Promise objects represent the eventual result of an asynchronous operation. The
	      primary way of interacting with a promise is through its `then` method, which
	      registers callbacks to receive either a promise's eventual value or the reason
	      why the promise cannot be fulfilled.

	      Terminology
	      -----------

	      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	      - `thenable` is an object or function that defines a `then` method.
	      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	      - `exception` is a value that is thrown using the throw statement.
	      - `reason` is a value that indicates why a promise was rejected.
	      - `settled` the final resting state of a promise, fulfilled or rejected.

	      A promise can be in one of three states: pending, fulfilled, or rejected.

	      Promises that are fulfilled have a fulfillment value and are in the fulfilled
	      state.  Promises that are rejected have a rejection reason and are in the
	      rejected state.  A fulfillment value is never a thenable.

	      Promises can also be said to *resolve* a value.  If this value is also a
	      promise, then the original promise's settled state will match the value's
	      settled state.  So a promise that *resolves* a promise that rejects will
	      itself reject, and a promise that *resolves* a promise that fulfills will
	      itself fulfill.


	      Basic Usage:
	      ------------

	      ```js
	      var promise = new Promise(function(resolve, reject) {
	        // on success
	        resolve(value);

	        // on failure
	        reject(reason);
	      });

	      promise.then(function(value) {
	        // on fulfillment
	      }, function(reason) {
	        // on rejection
	      });
	      ```

	      Advanced Usage:
	      ---------------

	      Promises shine when abstracting away asynchronous interactions such as
	      `XMLHttpRequest`s.

	      ```js
	      function getJSON(url) {
	        return new Promise(function(resolve, reject){
	          var xhr = new XMLHttpRequest();

	          xhr.open('GET', url);
	          xhr.onreadystatechange = handler;
	          xhr.responseType = 'json';
	          xhr.setRequestHeader('Accept', 'application/json');
	          xhr.send();

	          function handler() {
	            if (this.readyState === this.DONE) {
	              if (this.status === 200) {
	                resolve(this.response);
	              } else {
	                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	              }
	            }
	          };
	        });
	      }

	      getJSON('/posts.json').then(function(json) {
	        // on fulfillment
	      }, function(reason) {
	        // on rejection
	      });
	      ```

	      Unlike callbacks, promises are great composable primitives.

	      ```js
	      Promise.all([
	        getJSON('/posts'),
	        getJSON('/comments')
	      ]).then(function(values){
	        values[0] // => postsJSON
	        values[1] // => commentsJSON

	        return values;
	      });
	      ```

	      @class Promise
	      @param {function} resolver
	      Useful for tooling.
	      @constructor
	    */
	    function lib$es6$promise$promise$$Promise(resolver) {
	      this[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$nextId();
	      this._result = this._state = undefined;
	      this._subscribers = [];

	      if (lib$es6$promise$$internal$$noop !== resolver) {
	        typeof resolver !== 'function' && lib$es6$promise$promise$$needsResolver();
	        this instanceof lib$es6$promise$promise$$Promise ? lib$es6$promise$$internal$$initializePromise(this, resolver) : lib$es6$promise$promise$$needsNew();
	      }
	    }

	    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
	    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
	    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
	    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
	    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
	    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
	    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

	    lib$es6$promise$promise$$Promise.prototype = {
	      constructor: lib$es6$promise$promise$$Promise,

	    /**
	      The primary way of interacting with a promise is through its `then` method,
	      which registers callbacks to receive either a promise's eventual value or the
	      reason why the promise cannot be fulfilled.

	      ```js
	      findUser().then(function(user){
	        // user is available
	      }, function(reason){
	        // user is unavailable, and you are given the reason why
	      });
	      ```

	      Chaining
	      --------

	      The return value of `then` is itself a promise.  This second, 'downstream'
	      promise is resolved with the return value of the first promise's fulfillment
	      or rejection handler, or rejected if the handler throws an exception.

	      ```js
	      findUser().then(function (user) {
	        return user.name;
	      }, function (reason) {
	        return 'default name';
	      }).then(function (userName) {
	        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	        // will be `'default name'`
	      });

	      findUser().then(function (user) {
	        throw new Error('Found user, but still unhappy');
	      }, function (reason) {
	        throw new Error('`findUser` rejected and we're unhappy');
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	      });
	      ```
	      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

	      ```js
	      findUser().then(function (user) {
	        throw new PedagogicalException('Upstream error');
	      }).then(function (value) {
	        // never reached
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // The `PedgagocialException` is propagated all the way down to here
	      });
	      ```

	      Assimilation
	      ------------

	      Sometimes the value you want to propagate to a downstream promise can only be
	      retrieved asynchronously. This can be achieved by returning a promise in the
	      fulfillment or rejection handler. The downstream promise will then be pending
	      until the returned promise is settled. This is called *assimilation*.

	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // The user's comments are now available
	      });
	      ```

	      If the assimliated promise rejects, then the downstream promise will also reject.

	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // If `findCommentsByAuthor` fulfills, we'll have the value here
	      }, function (reason) {
	        // If `findCommentsByAuthor` rejects, we'll have the reason here
	      });
	      ```

	      Simple Example
	      --------------

	      Synchronous Example

	      ```javascript
	      var result;

	      try {
	        result = findResult();
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```

	      Errback Example

	      ```js
	      findResult(function(result, err){
	        if (err) {
	          // failure
	        } else {
	          // success
	        }
	      });
	      ```

	      Promise Example;

	      ```javascript
	      findResult().then(function(result){
	        // success
	      }, function(reason){
	        // failure
	      });
	      ```

	      Advanced Example
	      --------------

	      Synchronous Example

	      ```javascript
	      var author, books;

	      try {
	        author = findAuthor();
	        books  = findBooksByAuthor(author);
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```

	      Errback Example

	      ```js

	      function foundBooks(books) {

	      }

	      function failure(reason) {

	      }

	      findAuthor(function(author, err){
	        if (err) {
	          failure(err);
	          // failure
	        } else {
	          try {
	            findBoooksByAuthor(author, function(books, err) {
	              if (err) {
	                failure(err);
	              } else {
	                try {
	                  foundBooks(books);
	                } catch(reason) {
	                  failure(reason);
	                }
	              }
	            });
	          } catch(error) {
	            failure(err);
	          }
	          // success
	        }
	      });
	      ```

	      Promise Example;

	      ```javascript
	      findAuthor().
	        then(findBooksByAuthor).
	        then(function(books){
	          // found books
	      }).catch(function(reason){
	        // something went wrong
	      });
	      ```

	      @method then
	      @param {Function} onFulfilled
	      @param {Function} onRejected
	      Useful for tooling.
	      @return {Promise}
	    */
	      then: lib$es6$promise$then$$default,

	    /**
	      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	      as the catch block of a try/catch statement.

	      ```js
	      function findAuthor(){
	        throw new Error('couldn't find that author');
	      }

	      // synchronous
	      try {
	        findAuthor();
	      } catch(reason) {
	        // something went wrong
	      }

	      // async with promises
	      findAuthor().catch(function(reason){
	        // something went wrong
	      });
	      ```

	      @method catch
	      @param {Function} onRejection
	      Useful for tooling.
	      @return {Promise}
	    */
	      'catch': function(onRejection) {
	        return this.then(null, onRejection);
	      }
	    };
	    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;
	    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
	      this._instanceConstructor = Constructor;
	      this.promise = new Constructor(lib$es6$promise$$internal$$noop);

	      if (!this.promise[lib$es6$promise$$internal$$PROMISE_ID]) {
	        lib$es6$promise$$internal$$makePromise(this.promise);
	      }

	      if (lib$es6$promise$utils$$isArray(input)) {
	        this._input     = input;
	        this.length     = input.length;
	        this._remaining = input.length;

	        this._result = new Array(this.length);

	        if (this.length === 0) {
	          lib$es6$promise$$internal$$fulfill(this.promise, this._result);
	        } else {
	          this.length = this.length || 0;
	          this._enumerate();
	          if (this._remaining === 0) {
	            lib$es6$promise$$internal$$fulfill(this.promise, this._result);
	          }
	        }
	      } else {
	        lib$es6$promise$$internal$$reject(this.promise, lib$es6$promise$enumerator$$validationError());
	      }
	    }

	    function lib$es6$promise$enumerator$$validationError() {
	      return new Error('Array Methods must be provided an Array');
	    }

	    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
	      var length  = this.length;
	      var input   = this._input;

	      for (var i = 0; this._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
	        this._eachEntry(input[i], i);
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
	      var c = this._instanceConstructor;
	      var resolve = c.resolve;

	      if (resolve === lib$es6$promise$promise$resolve$$default) {
	        var then = lib$es6$promise$$internal$$getThen(entry);

	        if (then === lib$es6$promise$then$$default &&
	            entry._state !== lib$es6$promise$$internal$$PENDING) {
	          this._settledAt(entry._state, i, entry._result);
	        } else if (typeof then !== 'function') {
	          this._remaining--;
	          this._result[i] = entry;
	        } else if (c === lib$es6$promise$promise$$default) {
	          var promise = new c(lib$es6$promise$$internal$$noop);
	          lib$es6$promise$$internal$$handleMaybeThenable(promise, entry, then);
	          this._willSettleAt(promise, i);
	        } else {
	          this._willSettleAt(new c(function(resolve) { resolve(entry); }), i);
	        }
	      } else {
	        this._willSettleAt(resolve(entry), i);
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
	      var promise = this.promise;

	      if (promise._state === lib$es6$promise$$internal$$PENDING) {
	        this._remaining--;

	        if (state === lib$es6$promise$$internal$$REJECTED) {
	          lib$es6$promise$$internal$$reject(promise, value);
	        } else {
	          this._result[i] = value;
	        }
	      }

	      if (this._remaining === 0) {
	        lib$es6$promise$$internal$$fulfill(promise, this._result);
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
	      var enumerator = this;

	      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
	        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
	      }, function(reason) {
	        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
	      });
	    };
	    function lib$es6$promise$polyfill$$polyfill() {
	      var local;

	      if (typeof global !== 'undefined') {
	          local = global;
	      } else if (typeof self !== 'undefined') {
	          local = self;
	      } else {
	          try {
	              local = Function('return this')();
	          } catch (e) {
	              throw new Error('polyfill failed because global object is unavailable in this environment');
	          }
	      }

	      var P = local.Promise;

	      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
	        return;
	      }

	      local.Promise = lib$es6$promise$promise$$default;
	    }
	    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

	    var lib$es6$promise$umd$$ES6Promise = {
	      'Promise': lib$es6$promise$promise$$default,
	      'polyfill': lib$es6$promise$polyfill$$default
	    };

	    /* global define:true module:true window: true */
	    if ("function" === 'function' && __webpack_require__(16)['amd']) {
	      !(__WEBPACK_AMD_DEFINE_RESULT__ = function() { return lib$es6$promise$umd$$ES6Promise; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof module !== 'undefined' && module['exports']) {
	      module['exports'] = lib$es6$promise$umd$$ES6Promise;
	    } else if (typeof this !== 'undefined') {
	      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
	    }

	    lib$es6$promise$polyfill$$default();
	}).call(this);

	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(15), (function() { return this; }()), __webpack_require__(17)(module)))

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* (ignored) */

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    draining = true;
	    var currentQueue;
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        var i = -1;
	        while (++i < len) {
	            currentQueue[i]();
	        }
	        len = queue.length;
	    }
	    draining = false;
	}
	process.nextTick = function (fun) {
	    queue.push(fun);
	    if (!draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }
/******/ ])
});
