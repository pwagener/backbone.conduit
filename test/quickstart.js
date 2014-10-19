/**
 * This test module tests extra capabilities of the QuickStart collection
 */
define([
    'underscore',
    'backbone',
    "../lib/QuickStartCollection"
], function(_, Backbone, QuickStartCollection) {
    var a, b, c, d, e, fastCol, sandbox,
        syncSpy, addSpy, changeSpy, sortSpy;

    function initSpies(collection) {
        addSpy = sandbox.spy();
        collection.on("add", addSpy);

        changeSpy = sandbox.spy();
        collection.on("change", changeSpy);

        syncSpy = sandbox.spy();
        collection.on("sync", syncSpy);

        sortSpy = sandbox.spy();
        collection.on("sort", sortSpy);
    }

    function fetchAndRespond(options) {
        var context = options.context;
        var collection = options.collection;
        var data = options.data;
        var fetchOpts = options.fetchOpts;
        if (!(context && collection && data)) {
            throw new Error('Incorrect usage of "fetchAndRespond"');
        }

        var server = sandbox.useFakeServer();
        collection.fetch(fetchOpts);

        // Generate the response
        server.respondWith("GET", "/test", [
            200,
            { "Content-Type": "application/json" },
            JSON.stringify(data)
        ]);
        server.respond();
    }

    module("QuickStartCollection", {
        setup: function() {
            a         = new Backbone.Model({id: 3, label: 'a'});
            b         = new Backbone.Model({id: 2, label: 'b'});
            c         = new Backbone.Model({id: 1, label: 'c'});
            d         = new Backbone.Model({id: 0, label: 'd'});
            e         = null;
            fastCol = new QuickStartCollection();
            fastCol.url = "/test";

            // Use the "real" Backbone.ajax implementation so we can mock out
            // the lower-level XHR interactions.
            Backbone.ajax = function() {
                return Backbone.$.ajax.apply(Backbone.$, arguments);
            };

            sandbox = sinon.sandbox.create();
        },

        teardown: function () {
            var env = this;
            Backbone.ajax = function(settings) {
                env.ajaxSettings = settings;
            };

            sandbox.restore();
        }
    });

    test("can be created", 1, function() {
        equal(fastCol.length, 0);
    });

    test("can act like a regular collection", function () {
        initSpies(fastCol);

        fetchAndRespond({
            context: this,
            collection: fastCol,
            fetchOpts: {
                quickstart: false // turn off QuickStart behavior
            },
            data: [a.toJSON(), b.toJSON(), c.toJSON()]
        });

        // Verify 3 adds, no changes, one sync & the length of the collection
        equal(addSpy.callCount, 3);
        equal(changeSpy.callCount, 0);
        equal(syncSpy.callCount, 1);
        equal(fastCol.length, 3);
    });

    test("fetch still adds data", 1, function() {
        initSpies(fastCol);
        fetchAndRespond({
            context: this, collection: fastCol, data: [ a.toJSON(), b.toJSON(), c.toJSON() ]
        });
        equal(fastCol.length, 3);
    });

    test("fetch fires a sync", 1, function() {
        initSpies(fastCol);
        fetchAndRespond({
            context: this, collection: fastCol, data: [ a.toJSON(), b.toJSON() ]
        });
        equal(syncSpy.callCount, 1);
    });

    test("fetch does not fire change events", 1, function() {
        initSpies(fastCol);
        fetchAndRespond({
            context: this, collection: fastCol, data: [ a.toJSON() ]
        });
        equal(changeSpy.callCount, 0);
    });

    test("fetch does not fire add events", 1, function() {
        initSpies(fastCol);
        fetchAndRespond({
            context: this, collection: fastCol, data: [ a.toJSON(), b.toJSON(), c.toJSON() ]
        });
        equal(addSpy.callCount, 0);
    });

    test("fetch does not do any sorting, even if requested", 2, function() {
        initSpies(fastCol);
        fastCol.comparator = "label";
        fetchAndRespond({
            context: this,
            collection: fastCol,
            data: [ b.toJSON(), c.toJSON(), a.toJSON() ],
            fetchOpts: { sort: true }
        });

        equal(sortSpy.callCount, 0);
        equal(fastCol.at(0).get("label"), "b");
    });
});
