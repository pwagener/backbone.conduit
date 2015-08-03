'use strict';

var _ = require('underscore');
var Backbone = require('backbone');

var refill = require('./../src/refill');

describe("The refill module", function() {

    describe('when mixed into a Backbone.Collection', function() {
        var Collection;
        beforeEach(function() {
            Collection = Backbone.Collection.extend({ });
            Collection = refill.mixin(Collection);
        });

        it('returns a Constructor', function() {
            expect(Collection).to.be.a('function');
        });

        describe('and instantiated', function() {
            var badData = {id: 6, name: "six", first: 6};

            var instance;
            beforeEach(function() {
                instance = new Collection();
            });

            afterEach(function() {
                instance = null;
            });

            it('is still a Backbone Collection', function() {
                expect(instance).to.be.an.instanceOf(Backbone.Collection);
            });

            it('provides a "refill" method', function() {
                expect(instance.refill).to.be.a('function');
            });

            describe('and provided data via "reset"', function() {
                beforeEach(function() {
                    instance.reset(this.getSampleData());
                });

                it('contains the right data', function() {
                    expect(instance.length).to.equal(3);
                    expect(instance.get(2).get('name')).to.equal('two');
                });

                it('can empty itself with the "reset" method', function() {
                    instance.reset();
                    expect(instance.length).to.equal(0);
                });

                it('can empty itself with the "refill" method', function() {
                    instance.refill();
                    expect(instance.length).to.equal(0);
                });
            });

            describe('and provided data via "refill"', function() {
                beforeEach(function() {
                    instance.refill(this.getSampleData());
                });

                it('contains the right data', function() {
                    expect(instance.length).to.equal(3);
                    expect(instance.get(3).get('name')).to.equal('three');
                });

                it('can empty itself with the "reset" method', function() {
                    instance.reset();
                    expect(instance.length).to.equal(0);
                });

                it('can empty itself with the "refill" method', function() {
                    instance.refill();
                    expect(instance.length).to.equal(0);
                });

                it('replaces any existing models', function() {
                    instance.refill([ { id: 4, name: "four" }]);
                    expect(instance.length).to.equal(1);
                });

                it('allows resetting with models instead of raw data', function() {
                    var models = instance.models;
                    instance.refill(models);

                    expect(instance).to.have.length(3);
                    expect(instance.at(0).toJSON()).to.have.property('name', 'two');
                });
            });

            describe('and a sort is requested of "refill"', function() {
                beforeEach(function() {
                    instance.reset();
                });

                it('can handle natural sorting', function() {
                    instance.comparator = "id";
                    instance.refill(this.getSampleData(), { sort: true });
                    var first = instance.at(0);
                    expect(first.id).to.equal(1);
                });

                it('can handle a complex comparator', function() {
                    instance.comparator = function(item) {
                        return -1 * item.id;
                    };

                    instance.refill(this.getSampleData(), { sort: true });
                    var first = instance.at(0);
                    expect(first.id).to.equal(3);
                });
            });

            describe('and a listener is expecting events from "refill"', function() {
                beforeEach(function() {
                    instance.reset();
                });

                it('fires a "reset" event', function() {
                    var resetSpy = this.sinon.spy();
                    instance.on('reset', resetSpy);
                    instance.refill(this.getSampleData());

                    expect(resetSpy.callCount).to.equal(1);
                });

                it('does not fire an "add" for each model', function() {
                    var addSpy = this.sinon.spy();
                    instance.on('add', addSpy);
                    instance.refill(this.getSampleData());

                    expect(addSpy.callCount).to.equal(0);
                });
            });

            describe('and a custom Backbone.Model with "parse" & "validate" is used with "refill"', function() {
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

                var CustomCollection = refill.mixin(Backbone.Collection.extend({
                    model: CustomModel
                }));

                var customInstance;
                beforeEach(function() {
                    customInstance = new CustomCollection();
                });

                it('calls parse on the model', function() {
                    customInstance.refill(this.getSampleData());
                    expect(customInstance.at(0).has('calculated'));
                });

                it('will validate correctly after using "refill"', function() {
                    // This should not add anything
                    customInstance.refill(this.getSampleData());
                    expect(customInstance.add(badData, { validate: true })).to.equal(false);
                    expect(customInstance.length).to.equal(3);
                });
            });
        });
    });
});
