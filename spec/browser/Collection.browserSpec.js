/**
 * Test browser-specific pieces of the Collection
 */

var Conduit = require('./../../src/index');
var Collection = Conduit.Collection;
var mockServer = require('./../mockServer');

var FooCollection = Collection.extend({
    url: '/foo'
});

var sampleData = [
    {id: 2, name: "two", first: 0, second: 2},
    {id: 1, name: "one", first: 1, second: 0},
    {id: 3, name: "three", first: 1, second: 2}
];

function setUnderscorePath() {
    Conduit.config.setUnderscorePath('/base/node_modules/underscore/underscore.js');
}

describe('The Conduit Collection', function() {
    var collection;

    beforeEach(function() {
        collection = new FooCollection(null, {
            comparator: 'name'
        });
        mockServer.add({
            url: '/foo',
            data: sampleData
        });
    });

    it('instantiates an object', function() {
        expect(collection).to.be.an('object');
    });

    describe('when calling "fetch"', function() {
        var sortSpy;
        beforeEach(function() {
            sortSpy = this.sinon.spy(collection, 'sort');

            expect(collection).to.have.length(0);
            // Note mockServer provides synchronous fetching...
            collection.fetch({
                sort: true
            });
        });

        it('gets the sample data', function() {
            expect(collection).to.have.length(3);
        });

        it('uses synchronous sorting', function() {
            //noinspection BadExpressionStatementJS
            expect(sortSpy.called).to.be.true;
        });
    });

    describe('when resetting data unsorted', function() {
        beforeEach(function() {
            collection.comparator = null;
            collection.reset(sampleData);
            collection.comparator = 'name';
        });

        it('can sort data regularly', function() {
            collection.sort();
            expect(collection.at(0).get('name')).to.equal('one');
        });


        it('throws an error when sorting async w/o setting the underscore path', function() {
            var testMethod = _.bind(collection.sortAsync, collection);
            expect(testMethod).to.throw(Error);
        });

        it('can sort async if underscore path is set', function(done) {
            setUnderscorePath();
            collection.sortAsync().then(function() {
                expect(collection.at(0).get('name')).to.equal('one');
                done();
            });
        });
    });

    describe('when using "fetchJumbo"', function() {
        var sortSpy, _useWorkerToSortSpy;

        beforeEach(function(done) {
            sortSpy = this.sinon.spy(collection, 'sort');
            _useWorkerToSortSpy = this.sinon.spy(collection, '_useWorkerToSort');

            // Ensure an empty collection
            collection.reset();

            // Ensure we've finished fetching; won't be synchronous because of 'sortAsync'
            collection.once('sync', function() {
                done();
            });
            collection.fetchJumbo({
                sort: true
            });
        });

        it('receives the sample data', function() {
            expect(collection).to.have.length(3);
        });

        it('does not call synchronous sort', function() {
            //noinspection BadExpressionStatementJS
            expect(sortSpy.called).to.be.false;
        });

        it('calls _useWorkerToSort', function() {
            //noinspection BadExpressionStatementJS
            expect(_useWorkerToSortSpy.called).to.be.true;
        });

        it('contains sorted data', function() {
            expect(collection.at(1).get('name')).to.equal('three');
        })
    });
});