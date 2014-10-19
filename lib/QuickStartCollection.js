
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
         - Force no sorting in 'Collection.set' on fetch
     */
    var QuickStartCollection = SuperClass.extend({

        fetch: function (options) {
            options = options || {};

            var quickStart = _.isUndefined(options.quickstart) ?
                true :
                options.quickstart;

            if (quickStart) {
                // Install a custom converter for this request
                // (we really should wrap any explicitly provided converter)
                options.converters = options.converters || {
                    "text json": _.bind(this._shortCircuitThenParseJSON, this)
                };

                // Install a "complete" function to ensure we remove the short-circuit
                // on success or failure.  Note this means our short-circuit is still active
                // during any success/fail callbacks.
                var origComplete = options.complete;
                options.complete = _.bind(function(jqXhr, textStatus) {
                    this._removeShortCircuit();
                    if (origComplete) {
                        origComplete(jqXhr, textStatus);
                    }
                }, this);
            }

            return SuperClassProto.fetch.call(this, options);
        },

        /**
         * This method is installed as the jQuery JSON converter by the 'fetch'
         * call.  It swaps out this collection instance's Backbone.Collection.set
         * method for one that forces zero events be fired, as well as ignores
         * any sort requests.
         * @private
         */
        _shortCircuitThenParseJSON: function(data) {
            // Don't use the provided Collection.set(...)
            this._originalSet = _.bind(this.set, this);
            this.set = this._shortCircuitSet;

            // Don't use the provided Model.set(...) for the time being.  This nastiness will
            // be removed at the end of our completed response
            this._originalModelSet = this.model.prototype.set;
            this.model.prototype.set = QuickStartCollection._shortCircuitModelSet;
            return JSON.parse(data + "");
        },

        _removeShortCircuit: function() {
            this.model.prototype.set = this._originalModelSet;
            delete this._originalModelSet;

            this.set = this._originalSet;
            delete this._originalSet;
        },

        _shortCircuitSet: function(models, options) {
            // Force silence
            options.silent = true;

            if (options.sort) {
                options.sort = false;
            }

            return this._originalSet(models, options);
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
            for (var attr in attrs) {
                // NOTE:  no changes detection & event triggering

                //noinspection JSUnfilteredForInLoop
                val = attrs[attr];

                //noinspection JSUnfilteredForInLoop
                current[attr] = val;
            }

            return this;
        }
    });
    return  QuickStartCollection;
});