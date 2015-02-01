(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("backbone"), require("underscore"));
	else if(typeof define === 'function' && define.amd)
		define(["backbone", "underscore"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("backbone"), require("underscore")) : factory(root["Backbone"], root["_"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_6__) {
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

	var fill = __webpack_require__(2);
	var refill = __webpack_require__(3);
	var Collection = __webpack_require__(4);
	var fetchJumbo = __webpack_require__(5);

	Backbone.Conduit = module.exports = {
	    Promise: function () {
	        throw new TypeError('An ES6-compliant Promise implementation must be provided');
	    },

	    fill: fill,
	    refill: refill,
	    fetchJumbo: fetchJumbo,
	    Collection: Collection
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(6);
	var Backbone = __webpack_require__(1);
	var shortCircuit = __webpack_require__(7);

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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * This module provides a mixin for a Backbone.Collection to provide a method,
	 * 'fill(...)' that can be used as a performant replacement for
	 * 'Collection.reset(...)' in some circumstances.
	 */

	var _ = __webpack_require__(6);
	var Backbone = __webpack_require__(1);
	var shortCircuit = __webpack_require__(7);

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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * This module provides an out-of-the-box Collection implementation that leverages the
	 * Conduit capabilities to deal with large amounts of data.
	 */

	var Backbone = __webpack_require__(1);
	var _ = __webpack_require__(6);

	var refill = __webpack_require__(3);
	var fill = __webpack_require__(2);
	var fetchJumbo = __webpack_require__(5);

	// Extend Backbone.Collection and provide the 'refill' method
	var Collection = Backbone.Collection.extend({ });
	fetchJumbo.mixin(Collection);

	module.exports = Collection;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(6);
	var Backbone = __webpack_require__(1);
	var fill = __webpack_require__(2);
	var refill = __webpack_require__(3);

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
	 * This method is a replacement for Backbone.Collection.fetch that will use
	 * Conduit.Collection.fill/refill instead of Backbone.Collection.set/reset when data
	 * is successfully returned from the server.
	 */
	function fetchJumbo(options) {
	    options = options ? _.clone(options) : {};
	    if (options.parse === void 0) options.parse = true;
	    var success = options.success;
	    var collection = this;
	    options.success = function(resp) {
	        // This is the interesting line:  use refill/fill instead of reset/set
	        var method = options.reset ? 'refill' : 'fill';
	        collection[method](resp, options);
	        if (success) success(collection, resp, options);
	        collection.trigger('sync', collection, resp, options);
	    };
	    wrapError(this, options);
	    return this.sync('read', this, options);
	}

	var mixinObj = {
	    fetchJumbo: fetchJumbo
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

	module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * This module is shared between 'fill' and 'refill' as where the short-circuit method
	 * implementations live.
	 */
	var _ = __webpack_require__(6);
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
	    if (options.sort) {
	        options.sort = false;
	    }

	    var returnedModels = this._originalCollectionSet(models, options);

	    // Handle sorting after we have set everything
	    if (needsSort && _.isArray(returnedModels)) {
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

/***/ }
/******/ ])
});
