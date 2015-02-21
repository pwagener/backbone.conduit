'use strict';

var Collection = require('./../src/Collection');
var prototype = Collection.prototype;

describe("The Conduit.Collection", function() {

    it('has a "fill" method', function() {
        expect(prototype.fill).to.be.a('function');
    });

    it('has a "refill" method', function() {
        expect(Collection.prototype.refill).to.be.a('function');
    });

    it('has a "haul" method', function() {
        expect(Collection.prototype.haul).to.be.a('function');
    });

    it('has a "sortAsync" method', function() {
        expect(Collection.prototype.sortAsync).to.be.a('function');
    });

    describe('when using the constructor to initialize data', function() {
        var refillSpy, resetSpy, collection;

        beforeEach(function() {
            refillSpy = this.sinon.spy(Collection.prototype, 'refill');
            resetSpy = this.sinon.spy(Collection.prototype, 'reset');
            collection = new Collection(this.getSampleData());
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
