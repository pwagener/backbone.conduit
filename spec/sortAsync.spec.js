'use strict';

// TODO: rename this to sortAsync.serverSpec.js ... ?

var Backbone = require('backbone');
var _ = require('underscore');
var when = require('when');

var sortAsync = require('./../src/sortAsync');

describe('The sortAsync module', function() {
    var Collection;

    beforeEach(function() {
        Collection = Backbone.Collection.extend({
            comparator: 'name'
        });
        Collection = sortAsync.mixin(Collection);
    });

    it('returns a Constructor', function() {
        expect(Collection).to.be.a('function');
    });

    it('throws an exception if "sortAsync" is called on the server', function () {
        var collection = new Collection();
        expect(collection.sortAsync).to.throw(Error);
    });
});