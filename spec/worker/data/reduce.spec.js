'use strict';

var _ = require('underscore');
var mockConduitWorker = require('../mockConduitWorker');

var reduce = require('../../../src/worker/data/reduce');
var dataUtils = require('../../../src/worker/data/dataUtils');
var managedContext = require('../../../src/worker/managedContext');

describe('The data/reduce module', function() {

    it('provides a method named "reduce"', function() {
        expect(reduce.name).to.equal('reduce');
    });

    describe('when data is available', function() {
        var context;

        beforeEach(function() {
            mockConduitWorker.reset();
            context = mockConduitWorker.bindModule(reduce);
            context.registerComponent({
                name: 'testComponent',
                methods: [{
                    name: 'addSecondValues',

                    method: function(memo, item) {
                        return memo + item.second;
                    }
                }]
            });

            dataUtils.initStore({ reset: true });
            dataUtils.addTo(this.getSampleData());
        });

        it('adds up the "second" values of the data', function() {
            var result = context.reduce({
                reducer: 'addSecondValues',
                memo: 0
            });
            expect(result).to.equal(4);

            result = context.reduce({
                reducer: 'addSecondValues',
                memo: 10
            });
            expect(result).to.equal(14);
        });

        it('errors if you do not provide a reduce specification', function() {
            expect(context.reduce).to.throw(Error);
        });

        it('errors if you request a reducer that does not exist', function() {
            var bound = _.bind(context.reduce, context, { reducer: 'Foo!' });
            expect(bound).to.throw(Error);
        });

    });
});