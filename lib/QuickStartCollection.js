
define([
    "backbone",
    "underscore",
    "./ShortCircuitTrait"
], function(Backbone, _, ShortCircuitTrait) {

    var SuperClass = Backbone.Collection;
    var SuperClassProto = SuperClass.prototype;

    /*
     Implemented optimizations:
         - Short-circuit all the work in Model.set(...):
         - No change detection of attributes on 'fetch'
         - Force event silence from the 'Collection.set' method on fetch
         - Force no sorting in 'Collection.set' on fetch
     */
    var QuickStartCollection = Backbone.Collection.extend({ }, {
            description: {
                lead: "QuickStart Collection",
                details: "Initial data load does as little work as possible.  It skips Model validation, " +
                "change detection, ignores initial sort requests and forcibly silences 'change' events from the models."
            }
        }
    );

    ShortCircuitTrait.enable(QuickStartCollection);
    return  QuickStartCollection;
});