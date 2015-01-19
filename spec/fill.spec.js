'use strict';

var Backbone = require('backbone');
var fill = require('./../src/fill');

describe("The fill module", function() {
    describe("when mixed into a Backbone.Collection", function() {
        var Collection;
        beforeEach(function() {
            Collection = Backbone.Collection.extend({ });
            Collection = fill.mixin(Collection);
        });

        it('returns a Constructor', function() {
            expect(Collection).to.be.a('function');
        });
    });
});
