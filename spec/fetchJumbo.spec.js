/**
 *  NOTE:  this is a test for a deprecated module.
 */
'use strict';
var Backbone = require('backbone');

var fetchJumbo = require('./../src/fetchJumbo');

describe("The (deprecated) 'fetchJumbo' module", function() {
    var Collection;
    beforeEach(function() {
        Collection = Backbone.Collection.extend({
            url: '/foo'
        });
        Collection = fetchJumbo.mixin(Collection);
    });

    it('returns a Constructor', function() {
        expect(Collection).to.be.a('function');
    });

    it('mixes in "refill" if not already done', function() {
        expect(Collection.prototype.refill).to.be.a('function');
    });

    it('mixes in "fill" if not already done', function() {
        expect(Collection.prototype.fill).to.be.a('function');
    });

    it('provides the method "fetchJumbo(...)"', function() {
        expect(Collection.prototype.fetchJumbo).to.be.a('function');
    });
});