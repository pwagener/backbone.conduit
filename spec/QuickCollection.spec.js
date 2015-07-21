'use strict';

var QuickCollection = require('./../src/QuickCollection');
var prototype = QuickCollection.prototype;

describe("The Conduit.QuickCollection", function() {

    it('has a "fill" method', function() {
        expect(prototype.fill).to.be.a('function');
    });

    it('has a "refill" method', function() {
        expect(QuickCollection.prototype.refill).to.be.a('function');
    });

    it('has a "haul" method', function() {
        expect(QuickCollection.prototype.haul).to.be.a('function');
    });

    describe('when using the constructor to initialize data', function() {
        var refillSpy, resetSpy, collection;

        beforeEach(function() {
            refillSpy = this.sinon.spy(QuickCollection.prototype, 'refill');
            resetSpy = this.sinon.spy(QuickCollection.prototype, 'reset');
            collection = new QuickCollection(this.getSampleData());
        });

        it('uses "refill" ', function() {
            //noinspection BadExpressionStatementJS
            expect(refillSpy.calledOnce).to.be.true;
        });

        it('receives the test data', function() {
            expect(collection).to.have.length(3);
        });
    });
});
