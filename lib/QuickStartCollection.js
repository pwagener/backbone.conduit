
define([
    "backbone",
    "underscore"
], function(Backbone, _) {

    var SuperClass = Backbone.Collection;
    var SuperClassProto = SuperClass.prototype;

    /*
     Implemented optimizations:
     - Short-circuit all the work in Model.set(...):
     - No change detection of attributes on 'fetch'
     - Force event silence from the 'Collection.set' method on fetch
     - Force non-sorting in 'Collection.set' on fetch
     */
    var QuickStartCollection = SuperClass.extend({

        fetch: function (options) {
            // Don't use the provided Collection.set(...)
            this._reassignCollectionSet();

            // Don't use the provided Model.set(...)
            this._reassignModelSet();

            options = options || {};
            var origSuccess = options.success;
            options.success = _.bind(function (collection, response, options) {
                this._restoreModelSet();
                this._restoreCollectionSet();

                if (origSuccess) origSuccess(collection, response, options);
            }, this);

            return SuperClassProto.fetch.call(this, options);
        },

        _reassignCollectionSet: function() {
            this._originalSet = _.bind(this.set, this);
            this.set = this._shortCircuitSet;
        },

        _shortCircuitSet: function(models, options) {
            if (!options.silent) {
                options.silent = true;
            }

            if (options.sort) {
                options.sort = false;
            }

            return this._originalSet(models, options);
        },

        _restoreCollectionSet: function() {
            this.set = this._originalSet;
            delete this._originalSet;
        },

        _reassignModelSet: function () {
            this._originalModelSet = this.model.prototype.set;
            this.model.prototype.set = QuickStartCollection._shortCircuitModelSet;
        },


        _restoreModelSet: function () {
            this.model.prototype.set = this._originalModelSet;
            delete this._originalModelSet;
        }
    }, {
        description: {
            lead: "QuickStart Collection",
            details: "Initial data load does as little work as possible.  It skips Model validation, " +
                "change detection, ignores initial sort requests and forcibly silences 'change' events from the models."
        },

        /**
         * This method is swapped in for the 'Model.set(...)' method when doing a `fetch` on the QuickStartCollection.
         * It explicitly does not do model attribute change detection or triggering of model-level events.
         * instance.
         * @private
         */
        _shortCircuitModelSet: function (key, val) {
            // Just assign the attribute & move on.
            var attrs, current;
            if (key == null) return this;

            // Handle both `"key", value` and `{key: value}` -style arguments.
            if (typeof key === 'object') {
                attrs = key;
            } else {
                (attrs = {})[key] = val;
            }

            // NOTE:  no validation, un-setting, _previousAttributes updating
            current = this.attributes;

            for (attr in attrs) {
                // NOTE:  no changes detection & event triggering
                val = attrs[attr];
                current[attr] = val;
            }

            return this;
        }
    });
    return  QuickStartCollection;
});