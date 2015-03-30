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
	var when = __webpack_require__(13);

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

	    // TODO:  chain this promise
	    return when.promise(function(resolve, reject) {
	        var paths = options.paths || findDefaultWorkerPath();

	        if (_.isString(paths)) {
	            paths = [ paths ];
	        }
	        var searchOptions = {
	            Worker: WorkerConstructor,
	            fileName: workerFileName,
	            paths: paths,
	            debug: options.debug
	        };

	        workerProbe.searchPaths(searchOptions).then(function(foundPath) {
	            setValue(workerPathKey, foundPath);
	            resolve();
	        }).catch(function() {
	            reject(new Error('Did not find worker file in ' + paths));
	        });
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
	    getWorkerConstructor: getWorkerConstructor
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
	var when = __webpack_require__(13);

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
	var when = __webpack_require__(13);
	var Backbone = __webpack_require__(1);

	var config = __webpack_require__(2);
	var Boss = __webpack_require__(12);

	var refillModule = __webpack_require__(4);
	var fillModule = __webpack_require__(3);
	var haulModule = __webpack_require__(5);


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

	    // This overrides the corresponding method from the 'haul' module to plug into the data return path
	    // TODO:  is this necessary, since we are wholly overriding 'haul'?
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
	var when = __webpack_require__(13);

	var Boss = __webpack_require__(12);

	/**
	 * Creates a promise that will attempt to find the worker at a specific
	 * location.
	 * @return A promise that will be resolved either with nothing (i.e. the worker
	 * was not found), or will resolve with the path (i.e. a functional worker was
	 * found).  The promise is never rejected, allowing it to be used in 'when.all(...)'
	 * and similar structures.
	 * @private
	 */
	function _createProbePromise(Worker, path, fileName, debug) {
	    if (debug) {
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
	    return when.promise(function(resolve) {
	        try {
	            boss.makePromise({
	                method: 'ping',
	                autoTerminate: true
	            }).done(function(response) {
	                // Ping succeeded.  We found a functional worker
	                debug('Located worker at "' + fullPath + '" at "' + response + '"');
	                resolve(fullPath);
	            }, function() {
	                // Worker loaded, but ping error (yikes)
	                debug('Worker at "' + fullPath + '" did not respond');
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
	    return when.promise(function(resolve, reject) {
	        when.all(probePromises).then(function(results) {
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
	    // methods we can find.
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
	var when = __webpack_require__(13);

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

	        if (_.isUndefined(options.autoTerminate)) {
	            options.autoTerminate = 1000;
	        }
	        this.autoTerminate = options.autoTerminate;
	    },

	    /**
	     * Get a promise that will be resolved when the worker finishes
	     * @param details Details for the method call:
	     *   o method (required) The name of the method to call
	     *   o argument (optional) The single argument that will be passed to the
	     *     worker method you are calling
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

	        this._ensureWorker();
	        var self = this;

	        //noinspection JSUnresolvedFunction
	        return when.promise(function(resolve, reject) {
	            var worker = self.worker;
	            worker.onmessage = function(event) {
	                var result = event.data;

	                if (result instanceof Error) {
	                    // Reject if we get an error
	                    self.terminate();
	                    reject(result);
	                } else {
	                    resolve(result);
	                }
	            };

	            // Reject if we get an error.  This occurs, for instance, when the worker
	            // path is invalid
	            worker.onerror = function(err) {
	                self.terminate();
	                reject(err);
	            };

	            // TODO:  if details.argument is an easily measurable payload (i.e. a long string),
	            // use an ArrayBuffer to speed the transfer.
	            worker.postMessage(details);
	        }).finally(function() {

	            if (self.autoTerminate === true) {
	                // terminate immediately
	                self.terminate();
	            } else if (_.isNumber(self.autoTerminate)) {
	                // Set a timeout to terminate the worker if it is not used quickly enough
	                var callTerminate = _.bind(self.terminate, self);
	                self.terminateTimeoutHandle = setTimeout(callTerminate, self.autoTerminate);
	            }
	        });
	    },

	    /**
	     * Explicitly terminate the managed worker, if it hasn't been terminated yet.
	     */
	    terminate: function() {
	        if(this.worker) {
	            if (_.isFunction(this.worker.terminate)) {
	                this.worker.terminate();
	            }
	            this.worker = null;
	        }
	    },

	    /**
	     * Make sure our worker actually exists.  Create one if it does not
	     * @private
	     */
	    _ensureWorker: function () {
	        if (!this.worker) {
	            // Note this will never throw an error; construction always succeeds
	            // regardless of whether the path is valid or not
	            this.worker = new this.WorkerConstructor(this.WorkerFileLocation);
	        }
	    }
	};

	module.exports = Boss;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/** @license MIT License (c) copyright 2010-2014 original author or authors */

	/**
	 * Promises/A+ and when() implementation
	 * when is part of the cujoJS family of libraries (http://cujojs.com/)
	 * @author Brian Cavalier
	 * @author John Hann
	 * @version 3.7.2
	 */
	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require) {

		var timed = __webpack_require__(17);
		var array = __webpack_require__(18);
		var flow = __webpack_require__(19);
		var fold = __webpack_require__(20);
		var inspect = __webpack_require__(21);
		var generate = __webpack_require__(22);
		var progress = __webpack_require__(23);
		var withThis = __webpack_require__(24);
		var unhandledRejection = __webpack_require__(25);
		var TimeoutError = __webpack_require__(14);

		var Promise = [array, flow, fold, generate, progress,
			inspect, withThis, timed, unhandledRejection]
			.reduce(function(Promise, feature) {
				return feature(Promise);
			}, __webpack_require__(15));

		var apply = __webpack_require__(16)(Promise);

		// Public API

		when.promise     = promise;              // Create a pending promise
		when.resolve     = Promise.resolve;      // Create a resolved promise
		when.reject      = Promise.reject;       // Create a rejected promise

		when.lift        = lift;                 // lift a function to return promises
		when['try']      = attempt;              // call a function and return a promise
		when.attempt     = attempt;              // alias for when.try

		when.iterate     = Promise.iterate;      // DEPRECATED (use cujojs/most streams) Generate a stream of promises
		when.unfold      = Promise.unfold;       // DEPRECATED (use cujojs/most streams) Generate a stream of promises

		when.join        = join;                 // Join 2 or more promises

		when.all         = all;                  // Resolve a list of promises
		when.settle      = settle;               // Settle a list of promises

		when.any         = lift(Promise.any);    // One-winner race
		when.some        = lift(Promise.some);   // Multi-winner race
		when.race        = lift(Promise.race);   // First-to-settle race

		when.map         = map;                  // Array.map() for promises
		when.filter      = filter;               // Array.filter() for promises
		when.reduce      = lift(Promise.reduce);       // Array.reduce() for promises
		when.reduceRight = lift(Promise.reduceRight);  // Array.reduceRight() for promises

		when.isPromiseLike = isPromiseLike;      // Is something promise-like, aka thenable

		when.Promise     = Promise;              // Promise constructor
		when.defer       = defer;                // Create a {promise, resolve, reject} tuple

		// Error types

		when.TimeoutError = TimeoutError;

		/**
		 * Get a trusted promise for x, or by transforming x with onFulfilled
		 *
		 * @param {*} x
		 * @param {function?} onFulfilled callback to be called when x is
		 *   successfully fulfilled.  If promiseOrValue is an immediate value, callback
		 *   will be invoked immediately.
		 * @param {function?} onRejected callback to be called when x is
		 *   rejected.
		 * @param {function?} onProgress callback to be called when progress updates
		 *   are issued for x. @deprecated
		 * @returns {Promise} a new promise that will fulfill with the return
		 *   value of callback or errback or the completion value of promiseOrValue if
		 *   callback and/or errback is not supplied.
		 */
		function when(x, onFulfilled, onRejected, onProgress) {
			var p = Promise.resolve(x);
			if (arguments.length < 2) {
				return p;
			}

			return p.then(onFulfilled, onRejected, onProgress);
		}

		/**
		 * Creates a new promise whose fate is determined by resolver.
		 * @param {function} resolver function(resolve, reject, notify)
		 * @returns {Promise} promise whose fate is determine by resolver
		 */
		function promise(resolver) {
			return new Promise(resolver);
		}

		/**
		 * Lift the supplied function, creating a version of f that returns
		 * promises, and accepts promises as arguments.
		 * @param {function} f
		 * @returns {Function} version of f that returns promises
		 */
		function lift(f) {
			return function() {
				for(var i=0, l=arguments.length, a=new Array(l); i<l; ++i) {
					a[i] = arguments[i];
				}
				return apply(f, this, a);
			};
		}

		/**
		 * Call f in a future turn, with the supplied args, and return a promise
		 * for the result.
		 * @param {function} f
		 * @returns {Promise}
		 */
		function attempt(f /*, args... */) {
			/*jshint validthis:true */
			for(var i=0, l=arguments.length-1, a=new Array(l); i<l; ++i) {
				a[i] = arguments[i+1];
			}
			return apply(f, this, a);
		}

		/**
		 * Creates a {promise, resolver} pair, either or both of which
		 * may be given out safely to consumers.
		 * @return {{promise: Promise, resolve: function, reject: function, notify: function}}
		 */
		function defer() {
			return new Deferred();
		}

		function Deferred() {
			var p = Promise._defer();

			function resolve(x) { p._handler.resolve(x); }
			function reject(x) { p._handler.reject(x); }
			function notify(x) { p._handler.notify(x); }

			this.promise = p;
			this.resolve = resolve;
			this.reject = reject;
			this.notify = notify;
			this.resolver = { resolve: resolve, reject: reject, notify: notify };
		}

		/**
		 * Determines if x is promise-like, i.e. a thenable object
		 * NOTE: Will return true for *any thenable object*, and isn't truly
		 * safe, since it may attempt to access the `then` property of x (i.e.
		 *  clever/malicious getters may do weird things)
		 * @param {*} x anything
		 * @returns {boolean} true if x is promise-like
		 */
		function isPromiseLike(x) {
			return x && typeof x.then === 'function';
		}

		/**
		 * Return a promise that will resolve only once all the supplied arguments
		 * have resolved. The resolution value of the returned promise will be an array
		 * containing the resolution values of each of the arguments.
		 * @param {...*} arguments may be a mix of promises and values
		 * @returns {Promise}
		 */
		function join(/* ...promises */) {
			return Promise.all(arguments);
		}

		/**
		 * Return a promise that will fulfill once all input promises have
		 * fulfilled, or reject when any one input promise rejects.
		 * @param {array|Promise} promises array (or promise for an array) of promises
		 * @returns {Promise}
		 */
		function all(promises) {
			return when(promises, Promise.all);
		}

		/**
		 * Return a promise that will always fulfill with an array containing
		 * the outcome states of all input promises.  The returned promise
		 * will only reject if `promises` itself is a rejected promise.
		 * @param {array|Promise} promises array (or promise for an array) of promises
		 * @returns {Promise} promise for array of settled state descriptors
		 */
		function settle(promises) {
			return when(promises, Promise.settle);
		}

		/**
		 * Promise-aware array map function, similar to `Array.prototype.map()`,
		 * but input array may contain promises or values.
		 * @param {Array|Promise} promises array of anything, may contain promises and values
		 * @param {function(x:*, index:Number):*} mapFunc map function which may
		 *  return a promise or value
		 * @returns {Promise} promise that will fulfill with an array of mapped values
		 *  or reject if any input promise rejects.
		 */
		function map(promises, mapFunc) {
			return when(promises, function(promises) {
				return Promise.map(promises, mapFunc);
			});
		}

		/**
		 * Filter the provided array of promises using the provided predicate.  Input may
		 * contain promises and values
		 * @param {Array|Promise} promises array of promises and values
		 * @param {function(x:*, index:Number):boolean} predicate filtering predicate.
		 *  Must return truthy (or promise for truthy) for items to retain.
		 * @returns {Promise} promise that will fulfill with an array containing all items
		 *  for which predicate returned truthy.
		 */
		function filter(promises, predicate) {
			return when(promises, function(promises) {
				return Promise.filter(promises, predicate);
			});
		}

		return when;
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	})(__webpack_require__(26));


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */

	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {

		/**
		 * Custom error type for promises rejected by promise.timeout
		 * @param {string} message
		 * @constructor
		 */
		function TimeoutError (message) {
			Error.call(this);
			this.message = message;
			this.name = TimeoutError.name;
			if (typeof Error.captureStackTrace === 'function') {
				Error.captureStackTrace(this, TimeoutError);
			}
		}

		TimeoutError.prototype = Object.create(Error.prototype);
		TimeoutError.prototype.constructor = TimeoutError;

		return TimeoutError;
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(26)));

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */

	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function (require) {

		var makePromise = __webpack_require__(27);
		var Scheduler = __webpack_require__(28);
		var async = __webpack_require__(29).asap;

		return makePromise({
			scheduler: new Scheduler(async)
		});

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	})(__webpack_require__(26));


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */

	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {

		makeApply.tryCatchResolve = tryCatchResolve;

		return makeApply;

		function makeApply(Promise, call) {
			if(arguments.length < 2) {
				call = tryCatchResolve;
			}

			return apply;

			function apply(f, thisArg, args) {
				var p = Promise._defer();
				var l = args.length;
				var params = new Array(l);
				callAndResolve({ f:f, thisArg:thisArg, args:args, params:params, i:l-1, call:call }, p._handler);

				return p;
			}

			function callAndResolve(c, h) {
				if(c.i < 0) {
					return call(c.f, c.thisArg, c.params, h);
				}

				var handler = Promise._handler(c.args[c.i]);
				handler.fold(callAndResolveNext, c, void 0, h);
			}

			function callAndResolveNext(c, x, h) {
				c.params[c.i] = x;
				c.i -= 1;
				callAndResolve(c, h);
			}
		}

		function tryCatchResolve(f, thisArg, args, resolver) {
			try {
				resolver.resolve(f.apply(thisArg, args));
			} catch(e) {
				resolver.reject(e);
			}
		}

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(26)));




/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */

	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require) {

		var env = __webpack_require__(29);
		var TimeoutError = __webpack_require__(14);

		function setTimeout(f, ms, x, y) {
			return env.setTimer(function() {
				f(x, y, ms);
			}, ms);
		}

		return function timed(Promise) {
			/**
			 * Return a new promise whose fulfillment value is revealed only
			 * after ms milliseconds
			 * @param {number} ms milliseconds
			 * @returns {Promise}
			 */
			Promise.prototype.delay = function(ms) {
				var p = this._beget();
				this._handler.fold(handleDelay, ms, void 0, p._handler);
				return p;
			};

			function handleDelay(ms, x, h) {
				setTimeout(resolveDelay, ms, x, h);
			}

			function resolveDelay(x, h) {
				h.resolve(x);
			}

			/**
			 * Return a new promise that rejects after ms milliseconds unless
			 * this promise fulfills earlier, in which case the returned promise
			 * fulfills with the same value.
			 * @param {number} ms milliseconds
			 * @param {Error|*=} reason optional rejection reason to use, defaults
			 *   to a TimeoutError if not provided
			 * @returns {Promise}
			 */
			Promise.prototype.timeout = function(ms, reason) {
				var p = this._beget();
				var h = p._handler;

				var t = setTimeout(onTimeout, ms, reason, p._handler);

				this._handler.visit(h,
					function onFulfill(x) {
						env.clearTimer(t);
						this.resolve(x); // this = h
					},
					function onReject(x) {
						env.clearTimer(t);
						this.reject(x); // this = h
					},
					h.notify);

				return p;
			};

			function onTimeout(reason, h, ms) {
				var e = typeof reason === 'undefined'
					? new TimeoutError('timed out after ' + ms + 'ms')
					: reason;
				h.reject(e);
			}

			return Promise;
		};

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(26)));


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */

	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require) {

		var state = __webpack_require__(30);
		var applier = __webpack_require__(16);

		return function array(Promise) {

			var applyFold = applier(Promise);
			var toPromise = Promise.resolve;
			var all = Promise.all;

			var ar = Array.prototype.reduce;
			var arr = Array.prototype.reduceRight;
			var slice = Array.prototype.slice;

			// Additional array combinators

			Promise.any = any;
			Promise.some = some;
			Promise.settle = settle;

			Promise.map = map;
			Promise.filter = filter;
			Promise.reduce = reduce;
			Promise.reduceRight = reduceRight;

			/**
			 * When this promise fulfills with an array, do
			 * onFulfilled.apply(void 0, array)
			 * @param {function} onFulfilled function to apply
			 * @returns {Promise} promise for the result of applying onFulfilled
			 */
			Promise.prototype.spread = function(onFulfilled) {
				return this.then(all).then(function(array) {
					return onFulfilled.apply(this, array);
				});
			};

			return Promise;

			/**
			 * One-winner competitive race.
			 * Return a promise that will fulfill when one of the promises
			 * in the input array fulfills, or will reject when all promises
			 * have rejected.
			 * @param {array} promises
			 * @returns {Promise} promise for the first fulfilled value
			 */
			function any(promises) {
				var p = Promise._defer();
				var resolver = p._handler;
				var l = promises.length>>>0;

				var pending = l;
				var errors = [];

				for (var h, x, i = 0; i < l; ++i) {
					x = promises[i];
					if(x === void 0 && !(i in promises)) {
						--pending;
						continue;
					}

					h = Promise._handler(x);
					if(h.state() > 0) {
						resolver.become(h);
						Promise._visitRemaining(promises, i, h);
						break;
					} else {
						h.visit(resolver, handleFulfill, handleReject);
					}
				}

				if(pending === 0) {
					resolver.reject(new RangeError('any(): array must not be empty'));
				}

				return p;

				function handleFulfill(x) {
					/*jshint validthis:true*/
					errors = null;
					this.resolve(x); // this === resolver
				}

				function handleReject(e) {
					/*jshint validthis:true*/
					if(this.resolved) { // this === resolver
						return;
					}

					errors.push(e);
					if(--pending === 0) {
						this.reject(errors);
					}
				}
			}

			/**
			 * N-winner competitive race
			 * Return a promise that will fulfill when n input promises have
			 * fulfilled, or will reject when it becomes impossible for n
			 * input promises to fulfill (ie when promises.length - n + 1
			 * have rejected)
			 * @param {array} promises
			 * @param {number} n
			 * @returns {Promise} promise for the earliest n fulfillment values
			 *
			 * @deprecated
			 */
			function some(promises, n) {
				/*jshint maxcomplexity:7*/
				var p = Promise._defer();
				var resolver = p._handler;

				var results = [];
				var errors = [];

				var l = promises.length>>>0;
				var nFulfill = 0;
				var nReject;
				var x, i; // reused in both for() loops

				// First pass: count actual array items
				for(i=0; i<l; ++i) {
					x = promises[i];
					if(x === void 0 && !(i in promises)) {
						continue;
					}
					++nFulfill;
				}

				// Compute actual goals
				n = Math.max(n, 0);
				nReject = (nFulfill - n + 1);
				nFulfill = Math.min(n, nFulfill);

				if(n > nFulfill) {
					resolver.reject(new RangeError('some(): array must contain at least '
					+ n + ' item(s), but had ' + nFulfill));
				} else if(nFulfill === 0) {
					resolver.resolve(results);
				}

				// Second pass: observe each array item, make progress toward goals
				for(i=0; i<l; ++i) {
					x = promises[i];
					if(x === void 0 && !(i in promises)) {
						continue;
					}

					Promise._handler(x).visit(resolver, fulfill, reject, resolver.notify);
				}

				return p;

				function fulfill(x) {
					/*jshint validthis:true*/
					if(this.resolved) { // this === resolver
						return;
					}

					results.push(x);
					if(--nFulfill === 0) {
						errors = null;
						this.resolve(results);
					}
				}

				function reject(e) {
					/*jshint validthis:true*/
					if(this.resolved) { // this === resolver
						return;
					}

					errors.push(e);
					if(--nReject === 0) {
						results = null;
						this.reject(errors);
					}
				}
			}

			/**
			 * Apply f to the value of each promise in a list of promises
			 * and return a new list containing the results.
			 * @param {array} promises
			 * @param {function(x:*, index:Number):*} f mapping function
			 * @returns {Promise}
			 */
			function map(promises, f) {
				return Promise._traverse(f, promises);
			}

			/**
			 * Filter the provided array of promises using the provided predicate.  Input may
			 * contain promises and values
			 * @param {Array} promises array of promises and values
			 * @param {function(x:*, index:Number):boolean} predicate filtering predicate.
			 *  Must return truthy (or promise for truthy) for items to retain.
			 * @returns {Promise} promise that will fulfill with an array containing all items
			 *  for which predicate returned truthy.
			 */
			function filter(promises, predicate) {
				var a = slice.call(promises);
				return Promise._traverse(predicate, a).then(function(keep) {
					return filterSync(a, keep);
				});
			}

			function filterSync(promises, keep) {
				// Safe because we know all promises have fulfilled if we've made it this far
				var l = keep.length;
				var filtered = new Array(l);
				for(var i=0, j=0; i<l; ++i) {
					if(keep[i]) {
						filtered[j++] = Promise._handler(promises[i]).value;
					}
				}
				filtered.length = j;
				return filtered;

			}

			/**
			 * Return a promise that will always fulfill with an array containing
			 * the outcome states of all input promises.  The returned promise
			 * will never reject.
			 * @param {Array} promises
			 * @returns {Promise} promise for array of settled state descriptors
			 */
			function settle(promises) {
				return all(promises.map(settleOne));
			}

			function settleOne(p) {
				var h = Promise._handler(p);
				if(h.state() === 0) {
					return toPromise(p).then(state.fulfilled, state.rejected);
				}

				h._unreport();
				return state.inspect(h);
			}

			/**
			 * Traditional reduce function, similar to `Array.prototype.reduce()`, but
			 * input may contain promises and/or values, and reduceFunc
			 * may return either a value or a promise, *and* initialValue may
			 * be a promise for the starting value.
			 * @param {Array|Promise} promises array or promise for an array of anything,
			 *      may contain a mix of promises and values.
			 * @param {function(accumulated:*, x:*, index:Number):*} f reduce function
			 * @returns {Promise} that will resolve to the final reduced value
			 */
			function reduce(promises, f /*, initialValue */) {
				return arguments.length > 2 ? ar.call(promises, liftCombine(f), arguments[2])
						: ar.call(promises, liftCombine(f));
			}

			/**
			 * Traditional reduce function, similar to `Array.prototype.reduceRight()`, but
			 * input may contain promises and/or values, and reduceFunc
			 * may return either a value or a promise, *and* initialValue may
			 * be a promise for the starting value.
			 * @param {Array|Promise} promises array or promise for an array of anything,
			 *      may contain a mix of promises and values.
			 * @param {function(accumulated:*, x:*, index:Number):*} f reduce function
			 * @returns {Promise} that will resolve to the final reduced value
			 */
			function reduceRight(promises, f /*, initialValue */) {
				return arguments.length > 2 ? arr.call(promises, liftCombine(f), arguments[2])
						: arr.call(promises, liftCombine(f));
			}

			function liftCombine(f) {
				return function(z, x, i) {
					return applyFold(f, void 0, [z,x,i]);
				};
			}
		};

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(26)));


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */

	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {

		return function flow(Promise) {

			var resolve = Promise.resolve;
			var reject = Promise.reject;
			var origCatch = Promise.prototype['catch'];

			/**
			 * Handle the ultimate fulfillment value or rejection reason, and assume
			 * responsibility for all errors.  If an error propagates out of result
			 * or handleFatalError, it will be rethrown to the host, resulting in a
			 * loud stack track on most platforms and a crash on some.
			 * @param {function?} onResult
			 * @param {function?} onError
			 * @returns {undefined}
			 */
			Promise.prototype.done = function(onResult, onError) {
				this._handler.visit(this._handler.receiver, onResult, onError);
			};

			/**
			 * Add Error-type and predicate matching to catch.  Examples:
			 * promise.catch(TypeError, handleTypeError)
			 *   .catch(predicate, handleMatchedErrors)
			 *   .catch(handleRemainingErrors)
			 * @param onRejected
			 * @returns {*}
			 */
			Promise.prototype['catch'] = Promise.prototype.otherwise = function(onRejected) {
				if (arguments.length < 2) {
					return origCatch.call(this, onRejected);
				}

				if(typeof onRejected !== 'function') {
					return this.ensure(rejectInvalidPredicate);
				}

				return origCatch.call(this, createCatchFilter(arguments[1], onRejected));
			};

			/**
			 * Wraps the provided catch handler, so that it will only be called
			 * if the predicate evaluates truthy
			 * @param {?function} handler
			 * @param {function} predicate
			 * @returns {function} conditional catch handler
			 */
			function createCatchFilter(handler, predicate) {
				return function(e) {
					return evaluatePredicate(e, predicate)
						? handler.call(this, e)
						: reject(e);
				};
			}

			/**
			 * Ensures that onFulfilledOrRejected will be called regardless of whether
			 * this promise is fulfilled or rejected.  onFulfilledOrRejected WILL NOT
			 * receive the promises' value or reason.  Any returned value will be disregarded.
			 * onFulfilledOrRejected may throw or return a rejected promise to signal
			 * an additional error.
			 * @param {function} handler handler to be called regardless of
			 *  fulfillment or rejection
			 * @returns {Promise}
			 */
			Promise.prototype['finally'] = Promise.prototype.ensure = function(handler) {
				if(typeof handler !== 'function') {
					return this;
				}

				return this.then(function(x) {
					return runSideEffect(handler, this, identity, x);
				}, function(e) {
					return runSideEffect(handler, this, reject, e);
				});
			};

			function runSideEffect (handler, thisArg, propagate, value) {
				var result = handler.call(thisArg);
				return maybeThenable(result)
					? propagateValue(result, propagate, value)
					: propagate(value);
			}

			function propagateValue (result, propagate, x) {
				return resolve(result).then(function () {
					return propagate(x);
				});
			}

			/**
			 * Recover from a failure by returning a defaultValue.  If defaultValue
			 * is a promise, it's fulfillment value will be used.  If defaultValue is
			 * a promise that rejects, the returned promise will reject with the
			 * same reason.
			 * @param {*} defaultValue
			 * @returns {Promise} new promise
			 */
			Promise.prototype['else'] = Promise.prototype.orElse = function(defaultValue) {
				return this.then(void 0, function() {
					return defaultValue;
				});
			};

			/**
			 * Shortcut for .then(function() { return value; })
			 * @param  {*} value
			 * @return {Promise} a promise that:
			 *  - is fulfilled if value is not a promise, or
			 *  - if value is a promise, will fulfill with its value, or reject
			 *    with its reason.
			 */
			Promise.prototype['yield'] = function(value) {
				return this.then(function() {
					return value;
				});
			};

			/**
			 * Runs a side effect when this promise fulfills, without changing the
			 * fulfillment value.
			 * @param {function} onFulfilledSideEffect
			 * @returns {Promise}
			 */
			Promise.prototype.tap = function(onFulfilledSideEffect) {
				return this.then(onFulfilledSideEffect)['yield'](this);
			};

			return Promise;
		};

		function rejectInvalidPredicate() {
			throw new TypeError('catch predicate must be a function');
		}

		function evaluatePredicate(e, predicate) {
			return isError(predicate) ? e instanceof predicate : predicate(e);
		}

		function isError(predicate) {
			return predicate === Error
				|| (predicate != null && predicate.prototype instanceof Error);
		}

		function maybeThenable(x) {
			return (typeof x === 'object' || typeof x === 'function') && x !== null;
		}

		function identity(x) {
			return x;
		}

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(26)));


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */
	/** @author Jeff Escalante */

	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {

		return function fold(Promise) {

			Promise.prototype.fold = function(f, z) {
				var promise = this._beget();

				this._handler.fold(function(z, x, to) {
					Promise._handler(z).fold(function(x, z, to) {
						to.resolve(f.call(this, z, x));
					}, x, this, to);
				}, z, promise._handler.receiver, promise._handler);

				return promise;
			};

			return Promise;
		};

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(26)));


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */

	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require) {

		var inspect = __webpack_require__(30).inspect;

		return function inspection(Promise) {

			Promise.prototype.inspect = function() {
				return inspect(Promise._handler(this));
			};

			return Promise;
		};

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(26)));


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */

	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {

		return function generate(Promise) {

			var resolve = Promise.resolve;

			Promise.iterate = iterate;
			Promise.unfold = unfold;

			return Promise;

			/**
			 * @deprecated Use github.com/cujojs/most streams and most.iterate
			 * Generate a (potentially infinite) stream of promised values:
			 * x, f(x), f(f(x)), etc. until condition(x) returns true
			 * @param {function} f function to generate a new x from the previous x
			 * @param {function} condition function that, given the current x, returns
			 *  truthy when the iterate should stop
			 * @param {function} handler function to handle the value produced by f
			 * @param {*|Promise} x starting value, may be a promise
			 * @return {Promise} the result of the last call to f before
			 *  condition returns true
			 */
			function iterate(f, condition, handler, x) {
				return unfold(function(x) {
					return [x, f(x)];
				}, condition, handler, x);
			}

			/**
			 * @deprecated Use github.com/cujojs/most streams and most.unfold
			 * Generate a (potentially infinite) stream of promised values
			 * by applying handler(generator(seed)) iteratively until
			 * condition(seed) returns true.
			 * @param {function} unspool function that generates a [value, newSeed]
			 *  given a seed.
			 * @param {function} condition function that, given the current seed, returns
			 *  truthy when the unfold should stop
			 * @param {function} handler function to handle the value produced by unspool
			 * @param x {*|Promise} starting value, may be a promise
			 * @return {Promise} the result of the last value produced by unspool before
			 *  condition returns true
			 */
			function unfold(unspool, condition, handler, x) {
				return resolve(x).then(function(seed) {
					return resolve(condition(seed)).then(function(done) {
						return done ? seed : resolve(unspool(seed)).spread(next);
					});
				});

				function next(item, newSeed) {
					return resolve(handler(item)).then(function() {
						return unfold(unspool, condition, handler, newSeed);
					});
				}
			}
		};

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(26)));


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */

	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {

		return function progress(Promise) {

			/**
			 * @deprecated
			 * Register a progress handler for this promise
			 * @param {function} onProgress
			 * @returns {Promise}
			 */
			Promise.prototype.progress = function(onProgress) {
				return this.then(void 0, void 0, onProgress);
			};

			return Promise;
		};

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(26)));


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */

	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {

		return function addWith(Promise) {
			/**
			 * Returns a promise whose handlers will be called with `this` set to
			 * the supplied receiver.  Subsequent promises derived from the
			 * returned promise will also have their handlers called with receiver
			 * as `this`. Calling `with` with undefined or no arguments will return
			 * a promise whose handlers will again be called in the usual Promises/A+
			 * way (no `this`) thus safely undoing any previous `with` in the
			 * promise chain.
			 *
			 * WARNING: Promises returned from `with`/`withThis` are NOT Promises/A+
			 * compliant, specifically violating 2.2.5 (http://promisesaplus.com/#point-41)
			 *
			 * @param {object} receiver `this` value for all handlers attached to
			 *  the returned promise.
			 * @returns {Promise}
			 */
			Promise.prototype['with'] = Promise.prototype.withThis = function(receiver) {
				var p = this._beget();
				var child = p._handler;
				child.receiver = receiver;
				this._handler.chain(child, receiver);
				return p;
			};

			return Promise;
		};

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(26)));



/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */

	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require) {

		var setTimer = __webpack_require__(29).setTimer;
		var format = __webpack_require__(31);

		return function unhandledRejection(Promise) {

			var logError = noop;
			var logInfo = noop;
			var localConsole;

			if(typeof console !== 'undefined') {
				// Alias console to prevent things like uglify's drop_console option from
				// removing console.log/error. Unhandled rejections fall into the same
				// category as uncaught exceptions, and build tools shouldn't silence them.
				localConsole = console;
				logError = typeof localConsole.error !== 'undefined'
					? function (e) { localConsole.error(e); }
					: function (e) { localConsole.log(e); };

				logInfo = typeof localConsole.info !== 'undefined'
					? function (e) { localConsole.info(e); }
					: function (e) { localConsole.log(e); };
			}

			Promise.onPotentiallyUnhandledRejection = function(rejection) {
				enqueue(report, rejection);
			};

			Promise.onPotentiallyUnhandledRejectionHandled = function(rejection) {
				enqueue(unreport, rejection);
			};

			Promise.onFatalRejection = function(rejection) {
				enqueue(throwit, rejection.value);
			};

			var tasks = [];
			var reported = [];
			var running = null;

			function report(r) {
				if(!r.handled) {
					reported.push(r);
					logError('Potentially unhandled rejection [' + r.id + '] ' + format.formatError(r.value));
				}
			}

			function unreport(r) {
				var i = reported.indexOf(r);
				if(i >= 0) {
					reported.splice(i, 1);
					logInfo('Handled previous rejection [' + r.id + '] ' + format.formatObject(r.value));
				}
			}

			function enqueue(f, x) {
				tasks.push(f, x);
				if(running === null) {
					running = setTimer(flush, 0);
				}
			}

			function flush() {
				running = null;
				while(tasks.length > 0) {
					tasks.shift()(tasks.shift());
				}
			}

			return Promise;
		};

		function throwit(e) {
			throw e;
		}

		function noop() {}

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(26)));


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process) {/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */

	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {

		return function makePromise(environment) {

			var tasks = environment.scheduler;
			var emitRejection = initEmitRejection();

			var objectCreate = Object.create ||
				function(proto) {
					function Child() {}
					Child.prototype = proto;
					return new Child();
				};

			/**
			 * Create a promise whose fate is determined by resolver
			 * @constructor
			 * @returns {Promise} promise
			 * @name Promise
			 */
			function Promise(resolver, handler) {
				this._handler = resolver === Handler ? handler : init(resolver);
			}

			/**
			 * Run the supplied resolver
			 * @param resolver
			 * @returns {Pending}
			 */
			function init(resolver) {
				var handler = new Pending();

				try {
					resolver(promiseResolve, promiseReject, promiseNotify);
				} catch (e) {
					promiseReject(e);
				}

				return handler;

				/**
				 * Transition from pre-resolution state to post-resolution state, notifying
				 * all listeners of the ultimate fulfillment or rejection
				 * @param {*} x resolution value
				 */
				function promiseResolve (x) {
					handler.resolve(x);
				}
				/**
				 * Reject this promise with reason, which will be used verbatim
				 * @param {Error|*} reason rejection reason, strongly suggested
				 *   to be an Error type
				 */
				function promiseReject (reason) {
					handler.reject(reason);
				}

				/**
				 * @deprecated
				 * Issue a progress event, notifying all progress listeners
				 * @param {*} x progress event payload to pass to all listeners
				 */
				function promiseNotify (x) {
					handler.notify(x);
				}
			}

			// Creation

			Promise.resolve = resolve;
			Promise.reject = reject;
			Promise.never = never;

			Promise._defer = defer;
			Promise._handler = getHandler;

			/**
			 * Returns a trusted promise. If x is already a trusted promise, it is
			 * returned, otherwise returns a new trusted Promise which follows x.
			 * @param  {*} x
			 * @return {Promise} promise
			 */
			function resolve(x) {
				return isPromise(x) ? x
					: new Promise(Handler, new Async(getHandler(x)));
			}

			/**
			 * Return a reject promise with x as its reason (x is used verbatim)
			 * @param {*} x
			 * @returns {Promise} rejected promise
			 */
			function reject(x) {
				return new Promise(Handler, new Async(new Rejected(x)));
			}

			/**
			 * Return a promise that remains pending forever
			 * @returns {Promise} forever-pending promise.
			 */
			function never() {
				return foreverPendingPromise; // Should be frozen
			}

			/**
			 * Creates an internal {promise, resolver} pair
			 * @private
			 * @returns {Promise}
			 */
			function defer() {
				return new Promise(Handler, new Pending());
			}

			// Transformation and flow control

			/**
			 * Transform this promise's fulfillment value, returning a new Promise
			 * for the transformed result.  If the promise cannot be fulfilled, onRejected
			 * is called with the reason.  onProgress *may* be called with updates toward
			 * this promise's fulfillment.
			 * @param {function=} onFulfilled fulfillment handler
			 * @param {function=} onRejected rejection handler
			 * @param {function=} onProgress @deprecated progress handler
			 * @return {Promise} new promise
			 */
			Promise.prototype.then = function(onFulfilled, onRejected, onProgress) {
				var parent = this._handler;
				var state = parent.join().state();

				if ((typeof onFulfilled !== 'function' && state > 0) ||
					(typeof onRejected !== 'function' && state < 0)) {
					// Short circuit: value will not change, simply share handler
					return new this.constructor(Handler, parent);
				}

				var p = this._beget();
				var child = p._handler;

				parent.chain(child, parent.receiver, onFulfilled, onRejected, onProgress);

				return p;
			};

			/**
			 * If this promise cannot be fulfilled due to an error, call onRejected to
			 * handle the error. Shortcut for .then(undefined, onRejected)
			 * @param {function?} onRejected
			 * @return {Promise}
			 */
			Promise.prototype['catch'] = function(onRejected) {
				return this.then(void 0, onRejected);
			};

			/**
			 * Creates a new, pending promise of the same type as this promise
			 * @private
			 * @returns {Promise}
			 */
			Promise.prototype._beget = function() {
				return begetFrom(this._handler, this.constructor);
			};

			function begetFrom(parent, Promise) {
				var child = new Pending(parent.receiver, parent.join().context);
				return new Promise(Handler, child);
			}

			// Array combinators

			Promise.all = all;
			Promise.race = race;
			Promise._traverse = traverse;

			/**
			 * Return a promise that will fulfill when all promises in the
			 * input array have fulfilled, or will reject when one of the
			 * promises rejects.
			 * @param {array} promises array of promises
			 * @returns {Promise} promise for array of fulfillment values
			 */
			function all(promises) {
				return traverseWith(snd, null, promises);
			}

			/**
			 * Array<Promise<X>> -> Promise<Array<f(X)>>
			 * @private
			 * @param {function} f function to apply to each promise's value
			 * @param {Array} promises array of promises
			 * @returns {Promise} promise for transformed values
			 */
			function traverse(f, promises) {
				return traverseWith(tryCatch2, f, promises);
			}

			function traverseWith(tryMap, f, promises) {
				var handler = typeof f === 'function' ? mapAt : settleAt;

				var resolver = new Pending();
				var pending = promises.length >>> 0;
				var results = new Array(pending);

				for (var i = 0, x; i < promises.length && !resolver.resolved; ++i) {
					x = promises[i];

					if (x === void 0 && !(i in promises)) {
						--pending;
						continue;
					}

					traverseAt(promises, handler, i, x, resolver);
				}

				if(pending === 0) {
					resolver.become(new Fulfilled(results));
				}

				return new Promise(Handler, resolver);

				function mapAt(i, x, resolver) {
					if(!resolver.resolved) {
						traverseAt(promises, settleAt, i, tryMap(f, x, i), resolver);
					}
				}

				function settleAt(i, x, resolver) {
					results[i] = x;
					if(--pending === 0) {
						resolver.become(new Fulfilled(results));
					}
				}
			}

			function traverseAt(promises, handler, i, x, resolver) {
				if (maybeThenable(x)) {
					var h = getHandlerMaybeThenable(x);
					var s = h.state();

					if (s === 0) {
						h.fold(handler, i, void 0, resolver);
					} else if (s > 0) {
						handler(i, h.value, resolver);
					} else {
						resolver.become(h);
						visitRemaining(promises, i+1, h);
					}
				} else {
					handler(i, x, resolver);
				}
			}

			Promise._visitRemaining = visitRemaining;
			function visitRemaining(promises, start, handler) {
				for(var i=start; i<promises.length; ++i) {
					markAsHandled(getHandler(promises[i]), handler);
				}
			}

			function markAsHandled(h, handler) {
				if(h === handler) {
					return;
				}

				var s = h.state();
				if(s === 0) {
					h.visit(h, void 0, h._unreport);
				} else if(s < 0) {
					h._unreport();
				}
			}

			/**
			 * Fulfill-reject competitive race. Return a promise that will settle
			 * to the same state as the earliest input promise to settle.
			 *
			 * WARNING: The ES6 Promise spec requires that race()ing an empty array
			 * must return a promise that is pending forever.  This implementation
			 * returns a singleton forever-pending promise, the same singleton that is
			 * returned by Promise.never(), thus can be checked with ===
			 *
			 * @param {array} promises array of promises to race
			 * @returns {Promise} if input is non-empty, a promise that will settle
			 * to the same outcome as the earliest input promise to settle. if empty
			 * is empty, returns a promise that will never settle.
			 */
			function race(promises) {
				if(typeof promises !== 'object' || promises === null) {
					return reject(new TypeError('non-iterable passed to race()'));
				}

				// Sigh, race([]) is untestable unless we return *something*
				// that is recognizable without calling .then() on it.
				return promises.length === 0 ? never()
					 : promises.length === 1 ? resolve(promises[0])
					 : runRace(promises);
			}

			function runRace(promises) {
				var resolver = new Pending();
				var i, x, h;
				for(i=0; i<promises.length; ++i) {
					x = promises[i];
					if (x === void 0 && !(i in promises)) {
						continue;
					}

					h = getHandler(x);
					if(h.state() !== 0) {
						resolver.become(h);
						visitRemaining(promises, i+1, h);
						break;
					} else {
						h.visit(resolver, resolver.resolve, resolver.reject);
					}
				}
				return new Promise(Handler, resolver);
			}

			// Promise internals
			// Below this, everything is @private

			/**
			 * Get an appropriate handler for x, without checking for cycles
			 * @param {*} x
			 * @returns {object} handler
			 */
			function getHandler(x) {
				if(isPromise(x)) {
					return x._handler.join();
				}
				return maybeThenable(x) ? getHandlerUntrusted(x) : new Fulfilled(x);
			}

			/**
			 * Get a handler for thenable x.
			 * NOTE: You must only call this if maybeThenable(x) == true
			 * @param {object|function|Promise} x
			 * @returns {object} handler
			 */
			function getHandlerMaybeThenable(x) {
				return isPromise(x) ? x._handler.join() : getHandlerUntrusted(x);
			}

			/**
			 * Get a handler for potentially untrusted thenable x
			 * @param {*} x
			 * @returns {object} handler
			 */
			function getHandlerUntrusted(x) {
				try {
					var untrustedThen = x.then;
					return typeof untrustedThen === 'function'
						? new Thenable(untrustedThen, x)
						: new Fulfilled(x);
				} catch(e) {
					return new Rejected(e);
				}
			}

			/**
			 * Handler for a promise that is pending forever
			 * @constructor
			 */
			function Handler() {}

			Handler.prototype.when
				= Handler.prototype.become
				= Handler.prototype.notify // deprecated
				= Handler.prototype.fail
				= Handler.prototype._unreport
				= Handler.prototype._report
				= noop;

			Handler.prototype._state = 0;

			Handler.prototype.state = function() {
				return this._state;
			};

			/**
			 * Recursively collapse handler chain to find the handler
			 * nearest to the fully resolved value.
			 * @returns {object} handler nearest the fully resolved value
			 */
			Handler.prototype.join = function() {
				var h = this;
				while(h.handler !== void 0) {
					h = h.handler;
				}
				return h;
			};

			Handler.prototype.chain = function(to, receiver, fulfilled, rejected, progress) {
				this.when({
					resolver: to,
					receiver: receiver,
					fulfilled: fulfilled,
					rejected: rejected,
					progress: progress
				});
			};

			Handler.prototype.visit = function(receiver, fulfilled, rejected, progress) {
				this.chain(failIfRejected, receiver, fulfilled, rejected, progress);
			};

			Handler.prototype.fold = function(f, z, c, to) {
				this.when(new Fold(f, z, c, to));
			};

			/**
			 * Handler that invokes fail() on any handler it becomes
			 * @constructor
			 */
			function FailIfRejected() {}

			inherit(Handler, FailIfRejected);

			FailIfRejected.prototype.become = function(h) {
				h.fail();
			};

			var failIfRejected = new FailIfRejected();

			/**
			 * Handler that manages a queue of consumers waiting on a pending promise
			 * @constructor
			 */
			function Pending(receiver, inheritedContext) {
				Promise.createContext(this, inheritedContext);

				this.consumers = void 0;
				this.receiver = receiver;
				this.handler = void 0;
				this.resolved = false;
			}

			inherit(Handler, Pending);

			Pending.prototype._state = 0;

			Pending.prototype.resolve = function(x) {
				this.become(getHandler(x));
			};

			Pending.prototype.reject = function(x) {
				if(this.resolved) {
					return;
				}

				this.become(new Rejected(x));
			};

			Pending.prototype.join = function() {
				if (!this.resolved) {
					return this;
				}

				var h = this;

				while (h.handler !== void 0) {
					h = h.handler;
					if (h === this) {
						return this.handler = cycle();
					}
				}

				return h;
			};

			Pending.prototype.run = function() {
				var q = this.consumers;
				var handler = this.handler;
				this.handler = this.handler.join();
				this.consumers = void 0;

				for (var i = 0; i < q.length; ++i) {
					handler.when(q[i]);
				}
			};

			Pending.prototype.become = function(handler) {
				if(this.resolved) {
					return;
				}

				this.resolved = true;
				this.handler = handler;
				if(this.consumers !== void 0) {
					tasks.enqueue(this);
				}

				if(this.context !== void 0) {
					handler._report(this.context);
				}
			};

			Pending.prototype.when = function(continuation) {
				if(this.resolved) {
					tasks.enqueue(new ContinuationTask(continuation, this.handler));
				} else {
					if(this.consumers === void 0) {
						this.consumers = [continuation];
					} else {
						this.consumers.push(continuation);
					}
				}
			};

			/**
			 * @deprecated
			 */
			Pending.prototype.notify = function(x) {
				if(!this.resolved) {
					tasks.enqueue(new ProgressTask(x, this));
				}
			};

			Pending.prototype.fail = function(context) {
				var c = typeof context === 'undefined' ? this.context : context;
				this.resolved && this.handler.join().fail(c);
			};

			Pending.prototype._report = function(context) {
				this.resolved && this.handler.join()._report(context);
			};

			Pending.prototype._unreport = function() {
				this.resolved && this.handler.join()._unreport();
			};

			/**
			 * Wrap another handler and force it into a future stack
			 * @param {object} handler
			 * @constructor
			 */
			function Async(handler) {
				this.handler = handler;
			}

			inherit(Handler, Async);

			Async.prototype.when = function(continuation) {
				tasks.enqueue(new ContinuationTask(continuation, this));
			};

			Async.prototype._report = function(context) {
				this.join()._report(context);
			};

			Async.prototype._unreport = function() {
				this.join()._unreport();
			};

			/**
			 * Handler that wraps an untrusted thenable and assimilates it in a future stack
			 * @param {function} then
			 * @param {{then: function}} thenable
			 * @constructor
			 */
			function Thenable(then, thenable) {
				Pending.call(this);
				tasks.enqueue(new AssimilateTask(then, thenable, this));
			}

			inherit(Pending, Thenable);

			/**
			 * Handler for a fulfilled promise
			 * @param {*} x fulfillment value
			 * @constructor
			 */
			function Fulfilled(x) {
				Promise.createContext(this);
				this.value = x;
			}

			inherit(Handler, Fulfilled);

			Fulfilled.prototype._state = 1;

			Fulfilled.prototype.fold = function(f, z, c, to) {
				runContinuation3(f, z, this, c, to);
			};

			Fulfilled.prototype.when = function(cont) {
				runContinuation1(cont.fulfilled, this, cont.receiver, cont.resolver);
			};

			var errorId = 0;

			/**
			 * Handler for a rejected promise
			 * @param {*} x rejection reason
			 * @constructor
			 */
			function Rejected(x) {
				Promise.createContext(this);

				this.id = ++errorId;
				this.value = x;
				this.handled = false;
				this.reported = false;

				this._report();
			}

			inherit(Handler, Rejected);

			Rejected.prototype._state = -1;

			Rejected.prototype.fold = function(f, z, c, to) {
				to.become(this);
			};

			Rejected.prototype.when = function(cont) {
				if(typeof cont.rejected === 'function') {
					this._unreport();
				}
				runContinuation1(cont.rejected, this, cont.receiver, cont.resolver);
			};

			Rejected.prototype._report = function(context) {
				tasks.afterQueue(new ReportTask(this, context));
			};

			Rejected.prototype._unreport = function() {
				if(this.handled) {
					return;
				}
				this.handled = true;
				tasks.afterQueue(new UnreportTask(this));
			};

			Rejected.prototype.fail = function(context) {
				this.reported = true;
				emitRejection('unhandledRejection', this);
				Promise.onFatalRejection(this, context === void 0 ? this.context : context);
			};

			function ReportTask(rejection, context) {
				this.rejection = rejection;
				this.context = context;
			}

			ReportTask.prototype.run = function() {
				if(!this.rejection.handled && !this.rejection.reported) {
					this.rejection.reported = true;
					emitRejection('unhandledRejection', this.rejection) ||
						Promise.onPotentiallyUnhandledRejection(this.rejection, this.context);
				}
			};

			function UnreportTask(rejection) {
				this.rejection = rejection;
			}

			UnreportTask.prototype.run = function() {
				if(this.rejection.reported) {
					emitRejection('rejectionHandled', this.rejection) ||
						Promise.onPotentiallyUnhandledRejectionHandled(this.rejection);
				}
			};

			// Unhandled rejection hooks
			// By default, everything is a noop

			Promise.createContext
				= Promise.enterContext
				= Promise.exitContext
				= Promise.onPotentiallyUnhandledRejection
				= Promise.onPotentiallyUnhandledRejectionHandled
				= Promise.onFatalRejection
				= noop;

			// Errors and singletons

			var foreverPendingHandler = new Handler();
			var foreverPendingPromise = new Promise(Handler, foreverPendingHandler);

			function cycle() {
				return new Rejected(new TypeError('Promise cycle'));
			}

			// Task runners

			/**
			 * Run a single consumer
			 * @constructor
			 */
			function ContinuationTask(continuation, handler) {
				this.continuation = continuation;
				this.handler = handler;
			}

			ContinuationTask.prototype.run = function() {
				this.handler.join().when(this.continuation);
			};

			/**
			 * Run a queue of progress handlers
			 * @constructor
			 */
			function ProgressTask(value, handler) {
				this.handler = handler;
				this.value = value;
			}

			ProgressTask.prototype.run = function() {
				var q = this.handler.consumers;
				if(q === void 0) {
					return;
				}

				for (var c, i = 0; i < q.length; ++i) {
					c = q[i];
					runNotify(c.progress, this.value, this.handler, c.receiver, c.resolver);
				}
			};

			/**
			 * Assimilate a thenable, sending it's value to resolver
			 * @param {function} then
			 * @param {object|function} thenable
			 * @param {object} resolver
			 * @constructor
			 */
			function AssimilateTask(then, thenable, resolver) {
				this._then = then;
				this.thenable = thenable;
				this.resolver = resolver;
			}

			AssimilateTask.prototype.run = function() {
				var h = this.resolver;
				tryAssimilate(this._then, this.thenable, _resolve, _reject, _notify);

				function _resolve(x) { h.resolve(x); }
				function _reject(x)  { h.reject(x); }
				function _notify(x)  { h.notify(x); }
			};

			function tryAssimilate(then, thenable, resolve, reject, notify) {
				try {
					then.call(thenable, resolve, reject, notify);
				} catch (e) {
					reject(e);
				}
			}

			/**
			 * Fold a handler value with z
			 * @constructor
			 */
			function Fold(f, z, c, to) {
				this.f = f; this.z = z; this.c = c; this.to = to;
				this.resolver = failIfRejected;
				this.receiver = this;
			}

			Fold.prototype.fulfilled = function(x) {
				this.f.call(this.c, this.z, x, this.to);
			};

			Fold.prototype.rejected = function(x) {
				this.to.reject(x);
			};

			Fold.prototype.progress = function(x) {
				this.to.notify(x);
			};

			// Other helpers

			/**
			 * @param {*} x
			 * @returns {boolean} true iff x is a trusted Promise
			 */
			function isPromise(x) {
				return x instanceof Promise;
			}

			/**
			 * Test just enough to rule out primitives, in order to take faster
			 * paths in some code
			 * @param {*} x
			 * @returns {boolean} false iff x is guaranteed *not* to be a thenable
			 */
			function maybeThenable(x) {
				return (typeof x === 'object' || typeof x === 'function') && x !== null;
			}

			function runContinuation1(f, h, receiver, next) {
				if(typeof f !== 'function') {
					return next.become(h);
				}

				Promise.enterContext(h);
				tryCatchReject(f, h.value, receiver, next);
				Promise.exitContext();
			}

			function runContinuation3(f, x, h, receiver, next) {
				if(typeof f !== 'function') {
					return next.become(h);
				}

				Promise.enterContext(h);
				tryCatchReject3(f, x, h.value, receiver, next);
				Promise.exitContext();
			}

			/**
			 * @deprecated
			 */
			function runNotify(f, x, h, receiver, next) {
				if(typeof f !== 'function') {
					return next.notify(x);
				}

				Promise.enterContext(h);
				tryCatchReturn(f, x, receiver, next);
				Promise.exitContext();
			}

			function tryCatch2(f, a, b) {
				try {
					return f(a, b);
				} catch(e) {
					return reject(e);
				}
			}

			/**
			 * Return f.call(thisArg, x), or if it throws return a rejected promise for
			 * the thrown exception
			 */
			function tryCatchReject(f, x, thisArg, next) {
				try {
					next.become(getHandler(f.call(thisArg, x)));
				} catch(e) {
					next.become(new Rejected(e));
				}
			}

			/**
			 * Same as above, but includes the extra argument parameter.
			 */
			function tryCatchReject3(f, x, y, thisArg, next) {
				try {
					f.call(thisArg, x, y, next);
				} catch(e) {
					next.become(new Rejected(e));
				}
			}

			/**
			 * @deprecated
			 * Return f.call(thisArg, x), or if it throws, *return* the exception
			 */
			function tryCatchReturn(f, x, thisArg, next) {
				try {
					next.notify(f.call(thisArg, x));
				} catch(e) {
					next.notify(e);
				}
			}

			function inherit(Parent, Child) {
				Child.prototype = objectCreate(Parent.prototype);
				Child.prototype.constructor = Child;
			}

			function snd(x, y) {
				return y;
			}

			function noop() {}

			function initEmitRejection() {
				/*global process, self, CustomEvent*/
				if(typeof process !== 'undefined' && process !== null
					&& typeof process.emit === 'function') {
					// Returning falsy here means to call the default
					// onPotentiallyUnhandledRejection API.  This is safe even in
					// browserify since process.emit always returns falsy in browserify:
					// https://github.com/defunctzombie/node-process/blob/master/browser.js#L40-L46
					return function(type, rejection) {
						return type === 'unhandledRejection'
							? process.emit(type, rejection.value, rejection)
							: process.emit(type, rejection);
					};
				} else if(typeof self !== 'undefined' && typeof CustomEvent === 'function') {
					return (function(noop, self, CustomEvent) {
						var hasCustomEvent = false;
						try {
							var ev = new CustomEvent('unhandledRejection');
							hasCustomEvent = ev instanceof CustomEvent;
						} catch (e) {}

						return !hasCustomEvent ? noop : function(type, rejection) {
							var ev = new CustomEvent(type, {
								detail: {
									reason: rejection.value,
									key: rejection
								},
								bubbles: false,
								cancelable: true
							});

							return !self.dispatchEvent(ev);
						};
					}(noop, self, CustomEvent));
				}

				return noop;
			}

			return Promise;
		};
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(26)));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(33)))

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */

	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {

		// Credit to Twisol (https://github.com/Twisol) for suggesting
		// this type of extensible queue + trampoline approach for next-tick conflation.

		/**
		 * Async task scheduler
		 * @param {function} async function to schedule a single async function
		 * @constructor
		 */
		function Scheduler(async) {
			this._async = async;
			this._running = false;

			this._queue = this;
			this._queueLen = 0;
			this._afterQueue = {};
			this._afterQueueLen = 0;

			var self = this;
			this.drain = function() {
				self._drain();
			};
		}

		/**
		 * Enqueue a task
		 * @param {{ run:function }} task
		 */
		Scheduler.prototype.enqueue = function(task) {
			this._queue[this._queueLen++] = task;
			this.run();
		};

		/**
		 * Enqueue a task to run after the main task queue
		 * @param {{ run:function }} task
		 */
		Scheduler.prototype.afterQueue = function(task) {
			this._afterQueue[this._afterQueueLen++] = task;
			this.run();
		};

		Scheduler.prototype.run = function() {
			if (!this._running) {
				this._running = true;
				this._async(this.drain);
			}
		};

		/**
		 * Drain the handler queue entirely, and then the after queue
		 */
		Scheduler.prototype._drain = function() {
			var i = 0;
			for (; i < this._queueLen; ++i) {
				this._queue[i].run();
				this._queue[i] = void 0;
			}

			this._queueLen = 0;
			this._running = false;

			for (i = 0; i < this._afterQueueLen; ++i) {
				this._afterQueue[i].run();
				this._afterQueue[i] = void 0;
			}

			this._afterQueueLen = 0;
		};

		return Scheduler;

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(26)));


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;var require;/* WEBPACK VAR INJECTION */(function(process) {/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */

	/*global process,document,setTimeout,clearTimeout,MutationObserver,WebKitMutationObserver*/
	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require) {
		/*jshint maxcomplexity:6*/

		// Sniff "best" async scheduling option
		// Prefer process.nextTick or MutationObserver, then check for
		// setTimeout, and finally vertx, since its the only env that doesn't
		// have setTimeout

		var MutationObs;
		var capturedSetTimeout = typeof setTimeout !== 'undefined' && setTimeout;

		// Default env
		var setTimer = function(f, ms) { return setTimeout(f, ms); };
		var clearTimer = function(t) { return clearTimeout(t); };
		var asap = function (f) { return capturedSetTimeout(f, 0); };

		// Detect specific env
		if (isNode()) { // Node
			asap = function (f) { return process.nextTick(f); };

		} else if (MutationObs = hasMutationObserver()) { // Modern browser
			asap = initMutationObserver(MutationObs);

		} else if (!capturedSetTimeout) { // vert.x
			var vertxRequire = require;
			var vertx = __webpack_require__(32);
			setTimer = function (f, ms) { return vertx.setTimer(ms, f); };
			clearTimer = vertx.cancelTimer;
			asap = vertx.runOnLoop || vertx.runOnContext;
		}

		return {
			setTimer: setTimer,
			clearTimer: clearTimer,
			asap: asap
		};

		function isNode () {
			return typeof process !== 'undefined' && process !== null &&
				typeof process.nextTick === 'function';
		}

		function hasMutationObserver () {
			return (typeof MutationObserver === 'function' && MutationObserver) ||
				(typeof WebKitMutationObserver === 'function' && WebKitMutationObserver);
		}

		function initMutationObserver(MutationObserver) {
			var scheduled;
			var node = document.createTextNode('');
			var o = new MutationObserver(run);
			o.observe(node, { characterData: true });

			function run() {
				var f = scheduled;
				scheduled = void 0;
				f();
			}

			var i = 0;
			return function (f) {
				scheduled = f;
				node.data = (i ^= 1);
			};
		}
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(26)));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(33)))

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */

	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {

		return {
			pending: toPendingState,
			fulfilled: toFulfilledState,
			rejected: toRejectedState,
			inspect: inspect
		};

		function toPendingState() {
			return { state: 'pending' };
		}

		function toRejectedState(e) {
			return { state: 'rejected', reason: e };
		}

		function toFulfilledState(x) {
			return { state: 'fulfilled', value: x };
		}

		function inspect(handler) {
			var state = handler.state();
			return state === 0 ? toPendingState()
				 : state > 0   ? toFulfilledState(handler.value)
				               : toRejectedState(handler.value);
		}

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(26)));


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/** @license MIT License (c) copyright 2010-2014 original author or authors */
	/** @author Brian Cavalier */
	/** @author John Hann */

	(function(define) { 'use strict';
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {

		return {
			formatError: formatError,
			formatObject: formatObject,
			tryStringify: tryStringify
		};

		/**
		 * Format an error into a string.  If e is an Error and has a stack property,
		 * it's returned.  Otherwise, e is formatted using formatObject, with a
		 * warning added about e not being a proper Error.
		 * @param {*} e
		 * @returns {String} formatted string, suitable for output to developers
		 */
		function formatError(e) {
			var s = typeof e === 'object' && e !== null && e.stack ? e.stack : formatObject(e);
			return e instanceof Error ? s : s + ' (WARNING: non-Error used)';
		}

		/**
		 * Format an object, detecting "plain" objects and running them through
		 * JSON.stringify if possible.
		 * @param {Object} o
		 * @returns {string}
		 */
		function formatObject(o) {
			var s = String(o);
			if(s === '[object Object]' && typeof JSON !== 'undefined') {
				s = tryStringify(o, s);
			}
			return s;
		}

		/**
		 * Try to return the result of JSON.stringify(x).  If that fails, return
		 * defaultValue
		 * @param {*} x
		 * @param {*} defaultValue
		 * @returns {String|*} JSON.stringify(x) or defaultValue
		 */
		function tryStringify(x, defaultValue) {
			try {
				return JSON.stringify(x);
			} catch(e) {
				return defaultValue;
			}
		}

	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(26)));


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/* (ignored) */

/***/ },
/* 33 */
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


/***/ }
/******/ ])
});