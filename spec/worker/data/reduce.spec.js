'use strict';

var _ = require('underscore');
var mockConduitWorker = require('../mockConduitWorker');

var reduce = require('../../../src/worker/data/reduce');
var getDataUtils = require('../../../src/worker/data/getDataUtils');
var managedContext = require('../../../src/worker/managedContext');

describe('The data/reduce module', function() {

    it('provides a method named "reduce"', function() {
        expect(reduce.name).to.equal('reduce');
    });

    describe('when data is available', function() {
        var context;
        var dataUtils;

        beforeEach(function() {
            mockConduitWorker.reset();
            dataUtils = getDataUtils(mockConduitWorker.getCurrentObjectId());
            context = mockConduitWorker.bindModule(reduce);
            context.registerComponent({
                name: 'testComponent',
                methods: [{
                    name: 'addSecondValues',

                    method: function(memo, item) {
                        if (!_.isUndefined(this.count)) {
                            this.count++;
                        }
                        return memo + item.second;
                    }
                }]
            });

            dataUtils.initStore({ reset: true });
            dataUtils.addTo(this.getSampleData());
        });

        it('adds up the "second" values of the data', function() {
            var result = context.reduce({
                method: 'addSecondValues',
                memo: 0
            });
            expect(result).to.equal(4);

            result = context.reduce({
                method: 'addSecondValues',
                memo: 10
            });
            expect(result).to.equal(14);
        });

        it('errors if you do not provide a reduce specification', function() {
            expect(context.reduce).to.throw(Error);
        });

        it('errors if you request a reduce method that does not exist', function() {
            var bound = _.bind(context.reduce, context, { method: 'Foo!' });
            expect(bound).to.throw(Error);
        });

        it('allows you to provide a "context" option', function() {
            var reduceContext = { count: 0 };
            context.reduce({
                method: 'addSecondValues',
                memo: 0,
                context: reduceContext
            });

            expect(reduceContext).to.have.property('count', 3);
        });
    });
});
