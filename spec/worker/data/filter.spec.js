'use strict';

/**
 * Exercise the worker filter
 */
var _ = require('underscore');
var mockConduitWorker = require('../mockConduitWorker');

var filter = require('../../../src/worker/data/filter');
var dataUtils = require('../../../src/worker/data/dataUtils');
var managedContext = require('../../../src/worker/managedContext');

describe('the data/filter module', function() {

    it('provides a method named "filter"', function() {
        expect(filter.name).to.equal('filter');
    });

    describe('when data is available', function() {
        var context;

        beforeEach(function() {
            mockConduitWorker.reset();
            context = mockConduitWorker.bindModule(filter);
            context.registerComponent({
                name: 'testComponent',
                methods: [{
                    name: 'nameStartsWithT',
                    method: function(item) {
                        return item.name[0] === 't';
                    }
                }]
            });

            dataUtils.initStore({ reset: true });
            dataUtils.addTo(this.getSampleData());
        });

        it('returns the length when filtering by a set of properties; AKA "_.where(...)"', function() {
            var length = context.filter({ name: 'one' });
            expect(length).to.equal(1);
        });

        it('returns the length when filtering by an evaluation function; AKA "_.filter(...)"', function() {
            var length = context.filter('nameStartsWithT');
            expect(length).to.equal(2);
        });

        it('returns zero when nothing matches', function() {
            var length = context.filter({ name: 'four' });
            expect(length).to.equal(0);
        });

        it('errors when an unregistered evaluator is named', function() {
            var toError = _.bind(context.filter, context, 'nothingByThisName');
            expect(toError).to.throw(Error);
        });
    });
});