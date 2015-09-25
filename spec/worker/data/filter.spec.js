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
                        if (_.isUndefined(this.filteredCount)) {
                            this.filteredCount = 0;
                        }

                        var matches = item.name[0] === 't';
                        if (!matches) {
                            this.filteredCount++;
                        }

                        return matches;
                    }
                }]
            });

            dataUtils.initStore({ reset: true });
            dataUtils.addTo(this.getSampleData());
        });

        it('returns an object with length when filtering by a set of properties; AKA "_.where(...)"', function() {
            var length = context.filter({
                where: {
                    name: 'one'
                }
            }).length;
            expect(length).to.equal(1);
        });

        it('returns an object with length when filtering by an evaluation function; AKA "_.filter(...)"', function() {
            var length = context.filter({
                evaluator: 'nameStartsWithT'
            }).length;
            expect(length).to.equal(2);
        });

        it('returns an object with length of zero when nothing matches', function() {
            var length = context.filter({
                where: {
                    name: 'four'
                }
            }).length;
            expect(length).to.equal(0);
        });

        it('errors when an unregistered evaluator is named', function() {
            var toError = _.bind(context.filter, context, { method: 'nothingByThisName' });
            expect(toError).to.throw(Error);
        });

        it('can accept and return a context for the filtering', function() {
            var filterContext = {};
            var result = context.filter({
                evaluator: 'nameStartsWithT',
                context: filterContext
            });

            expect(result.context).to.have.property('filteredCount', 1);
        });
    });
});