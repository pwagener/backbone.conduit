'use strict';

var Backbone = require('backbone');

// TODO:  why can't this be 'lib/fill'?
var fill = require('./../src/fill');

describe("The fill module", function() {

    describe('when mixed into a Backbone.Collection', function() {
        var Collection;
        beforeEach(function() {
            Collection = Backbone.Collection.extend({ });
            Collection = fill.mixin(Collection);
        });

        it('returns a Constructor', function() {
            expect(Collection).to.be.a('function');
        });

        describe('and instantiated', function() {
            var sampleData = [
                { id: 2, name: "two" },
                { id: 1, name: "one" },
                { id: 3, name: "three" }
            ];

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

            it('provides a "fill" method', function() {
                expect(instance.fill).to.be.a('function');
            });

            describe('and provided data via "reset"', function() {
                beforeEach(function() {
                    instance.reset(sampleData);
                });

                it('contains the right data', function() {
                    expect(instance.length).to.equal(3);
                    expect(instance.get(2).get('name')).to.equal('two');
                });

                it('can empty itself with the "reset" method', function() {
                    instance.reset();
                    expect(instance.length).to.equal(0);
                });

                it('can empty itself with the "fill" method', function() {
                    instance.fill();
                    expect(instance.length).to.equal(0);
                });
            });

            describe('and provided data via "fill"', function() {
                beforeEach(function() {
                    instance.fill(sampleData);
                });

                it('contains the right data', function() {
                    expect(instance.length).to.equal(3);
                    expect(instance.get(3).get('name')).to.equal('three');
                });

                it('can empty itself with the "reset" method', function() {
                    instance.reset();
                    expect(instance.length).to.equal(0);
                });

                it('can empty itself with the "fill" method', function() {
                    instance.fill();
                    expect(instance.length).to.equal(0);
                });

                it('replaces any existing models', function() {
                    instance.fill([ { id: 4, name: "four" }]);
                    expect(instance.length).to.equal(1);
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

            describe('and a listener is expecting events from "fill"', function() {
                beforeEach(function() {
                    instance.reset();
                });

                it('fires a "reset" event', function() {
                    var resetSpy = this.sinon.spy();
                    instance.on('reset', resetSpy);
                    instance.fill(sampleData);

                    expect(resetSpy.callCount).to.equal(1);
                });

                it('fires a "fill" event', function() {
                    var fillSpy = this.sinon.spy();
                    instance.on('fill', fillSpy);
                    instance.fill(sampleData);
                    expect(fillSpy.callCount).to.equal(1);
                    //noinspection BadExpressionStatementJS
                    expect(fillSpy.calledWith(instance)).to.be.true;
                });

                it('does not fire an "add" for each model', function() {
                    var addSpy = this.sinon.spy();
                    instance.on('add', addSpy);
                    instance.fill(sampleData);

                    expect(addSpy.callCount).to.equal(0);
                });
            });
        });
    });
});
