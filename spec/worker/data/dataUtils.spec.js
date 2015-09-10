'use strict';

/**
 * Tests for the data utils
 */

var _ = require('underscore');

var mockConduitWorker = require('../mockConduitWorker');

var dataUtils = require('./../../../src/worker/data/dataUtils');

describe('The worker/dataUtils module', function() {
    var context, data;

    beforeEach(function() {
        mockConduitWorker.reset();
        context = mockConduitWorker.get();
        data = this.getSampleData();
    });

    it('initializes the context to have a "data" property', function() {
        dataUtils.initStore();
        expect(context._data).to.be.an('array');
    });

    it('will not recreate the data store by default', function() {
        context._data = [ { foo: "bar" }];
        dataUtils.initStore();
        expect(context._data).to.have.length(1);
    });

    it('will recreate the data store if explicitly requested', function() {
        context._data = [ { foo: "bar" } ];
        dataUtils.initStore({ reset: true });
        expect(context._data).to.have.length(0);
    });

    it('does not modify an array of data when parsing', function() {
        var result = dataUtils.parseData(data);
        expect(result).to.equal(data);
    });

    it('parses a JSON string of an array into an array', function() {
        var dataStr = JSON.stringify(data);
        var result = dataUtils.parseData(dataStr);
        expect(result).to.deep.equal(data);
    });

    it('errors when parsing JSON that is not an array', function() {
        var nonArrayStr = JSON.stringify({ foo: 'bar' });
        var bound = _.bind(dataUtils.parseData, dataUtils, nonArrayStr);
        expect(bound).to.throw(Error);
    });

    describe('after initializing and adding data', function() {
        var data;
        beforeEach(function() {
            dataUtils.initStore({ reset: true });
            dataUtils.addTo(this.getSampleData());
            data = dataUtils.getData();
        });

        it('contains the fresh data', function() {
            expect(data).to.have.length(3);
            expect(data[2]).to.have.property('name', 'three');
        });

        it('can add data to existing', function() {
            dataUtils.addTo([
                { id: 10, name: "ten", first: 6, second: 4 }
            ]);

            expect(data).to.have.length(4);
            expect(data[3]).have.property('name', 'ten');
        });

        it('can add null to existing', function() {
            dataUtils.addTo([
                null
            ]);

            expect(data).to.have.length(4);
            expect(data[3]).to.equal(null);
        });

        it('can merge data with existing', function() {
            dataUtils.addTo([
                { id: 3, name: "THREE" }
            ]);
            data = dataUtils.getData();

            expect(data).to.have.length(3);
            expect(data[2]).to.have.property('name', 'THREE');
        });

        it('can merge data by replacing', function() {
            dataUtils.addTo([
                { id: 3, name: 'three', first: 3 }
            ], {
                replace: true
            });
            data = dataUtils.getData();
            expect(data).to.have.length(3);
            var modified = data[2];
            expect(modified).to.have.property('name', 'three');
            expect(modified).to.not.have.property('second');
        });

        it('sets "_dataIndex" property to initial data correctly', function() {
            for (var i = 0; i < data.length; i++) {
                var current = data[i];
                expect(current._dataIndex).to.equal(i);
            }
        });

        it('sets "_dataIndex" property to added data properly', function() {
            dataUtils.addTo([
                { id: 10, name: "ten", first: 6, second: 4 }
            ]);
            data = dataUtils.getData();

            for (var i = 0; i < data.length; i++) {
                var current = data[i];
                expect(current._dataIndex).to.equal(i);
            }
        });

        it('does not disturb the "_dataIndex" property of merged data', function() {
            dataUtils.addTo([
                { id: 3, name: "THREE" }
            ]);
            data = dataUtils.getData();

            for (var i = 0; i < data.length; i++) {
                var current = data[i];
                expect(current._dataIndex).to.equal(i);
            }
        });

        it('begins its life with its projected data equaling "_data"', function() {
            var projected = dataUtils.getData();
            expect(projected).to.equal(data);
        });

        describe('when one projection has been applied', function() {
            var projectionSpy, data;
            beforeEach(function() {
                var nameMustStartWithT = function(data) {
                    return _.filter(data, function(item) {
                        return item.name[0] == 't';
                    });
                };
                projectionSpy = this.sinon.spy(nameMustStartWithT);

                dataUtils.applyProjection(projectionSpy);
                data = dataUtils.getData();
            });

            it('returns projected data', function() {
                expect(data).to.have.length(2);
                expect(data[0]).to.have.property('name', 'two');
                expect(data[1]).to.have.property('name', 'three');
            });

            it('still has the original data', function() {
                expect(context._data).to.have.length(3);
            });

            it('reapplies the projection when data is added', function() {
                expect(projectionSpy.callCount).to.equal(1);
                dataUtils.addTo([
                    { id: 4, name: 'four', first: 2, second: 2 },
                    { id: 12, name: 'twelve', first: 10, second: 2 }
                ]);

                expect(projectionSpy.callCount).to.equal(2);
                data = dataUtils.getData();
                expect(data).to.have.length(3);
                expect(data[2]).to.have.property('name', 'twelve');
            });

            it('resets the data back to the original', function() {
                dataUtils.resetProjection();
                data = dataUtils.getData();
                expect(data).to.have.length(3);
            });

            it('does not apply projections after a reset', function() {
                dataUtils.resetProjection();
                dataUtils.addTo([
                    { id: 4, name: 'four', first: 2, second: 2 }
                ]);

                expect(projectionSpy.callCount).to.equal(1);
            });

            it('contains all added data after a reset', function() {
                dataUtils.addTo([
                    { id: 4, name: 'four', first: 2, second: 2 },
                    { id: 12, name: 'twelve', first: 10, second: 2 }
                ]);

                dataUtils.resetProjection();
                data = dataUtils.getData();

                expect(data).to.have.length(5);
            });
        });
    });
});