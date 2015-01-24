'use strict';

var Backbone = require('backbone');
var _ = require('underscore');
var fill = require('./../src/fill');

describe("The fill module", function() {
    describe("when mixed into a Backbone.Collection", function() {
        var Collection;
        beforeEach(function() {
            Collection = Backbone.Collection.extend({
                comparator: 'name'
            });
            Collection = fill.mixin(Collection);
        });

        it('returns a Constructor', function() {
            expect(Collection).to.be.a('function');
        });

        describe('and instantiated', function() {
            var sampleData = [
                {id: 2, name: "two", first: 0, second: 2},
                {id: 1, name: "one", first: 1, second: 0},
                {id: 3, name: "three", first: 1, second: 2}
            ];

            var extraData = [
                {id: 4, name: "four", first: 2, second: 2},
                {id: 5, name: "five", first: 2, second: 3}
            ];

            var badData = {id: 6, name: "six", first: 6};

            var instance;
            beforeEach(function () {
                instance = new Collection();
            });

            afterEach(function () {
                instance = null;
            });

            it('is still a Backbone Collection', function () {
                expect(instance).to.be.an.instanceOf(Backbone.Collection);
            });

            it('provides a "fill" method', function () {
                expect(instance.fill).to.be.a('function');
            });

            describe('and provided data via "fill"', function () {
                beforeEach(function () {
                    instance.fill(sampleData);
                });

                it('contains the right data', function () {
                    expect(instance.length).to.equal(3);
                    expect(instance.get(3).get('name')).to.equal('three');
                });

                it('can add more data after its initial fill', function() {
                    instance.fill(extraData, { add: true, remove: false });
                    expect(instance.length).to.equal(5);
                    expect(instance.get(4).get('name')).to.equal('four');
                    expect(instance.get(5).get('second')).to.equal(3);
                });

                it('can replace data after its initial fill', function() {
                    instance.fill(extraData);
                    expect(instance.length).to.equal(2);
                    expect(instance.get(4).get('name')).to.equal('four');
                    expect(instance.get(5).get('second')).to.equal(3);
                });
            });

            describe('and a sort is requested of "fill"', function() {
                beforeEach(function() {
                    instance.reset();
                });

                it('can handle natural sorting', function() {
                    instance.comparator = "id";
                    instance.fill(sampleData, { sort: true });
                    var first = instance.at(0);
                    expect(first.id).to.equal(1);
                });

                it('can handle a complex comparator', function() {
                    instance.comparator = function(item) {
                        return -1 * item.id;
                    };

                    instance.fill(sampleData, { sort: true });
                    var first = instance.at(0);
                    expect(first.id).to.equal(3);
                });
            });

            describe("and we are listening for events when filling", function() {
                var firedEvents;
                beforeEach(function() {
                    firedEvents = {};
                    instance.on('all', function(event) {
                        if (!firedEvents[event]) {
                            firedEvents[event] = 0;
                        }
                        firedEvents[event]++;
                    });
                    instance.fill(sampleData, { sort: true });
                });

                it('fires a single "fill" event', function() {
                    expect(firedEvents.fill).to.equal(1);
                });

                it('does not fire any add/change/remove events', function() {
                    expect(firedEvents.add).to.equal(undefined);
                    expect(firedEvents.change).to.equal(undefined);
                    expect(firedEvents.remove).to.equal(undefined);
                });

                it('fires a single "sort" event', function() {
                    expect(firedEvents.sort).to.equal(1);
                });
            });

            describe('and a custom Backbone.Model with "parse" & "validate" is used with "fill"', function() {
                var CustomModel = Backbone.Model.extend({
                    parse: function(results) {
                        results.calculated = results.first + results.second;
                        return results;
                    },
                    validate: function(attributes) {
                        if (_.isUndefined(attributes.first) ||
                            _.isUndefined(attributes.second)) {
                            return new Error("Please provide 'first' and 'second'");
                        }
                    }
                });

                var CustomCollection = fill.mixin(Backbone.Collection.extend({
                    model: CustomModel
                }));

                var customInstance;
                beforeEach(function() {
                    customInstance = new CustomCollection();
                });

                it('calls parse on the model', function() {
                    customInstance.fill(sampleData);
                    expect(customInstance.at(0).has('calculated'));
                });

                it('will validate correctly after using "refill"', function() {
                    // This should not add anything
                    customInstance.fill(sampleData);
                    expect(customInstance.add(badData, { validate: true })).to.equal(false);
                    expect(customInstance.length).to.equal(3);
                });
            });
        });
    });
});
