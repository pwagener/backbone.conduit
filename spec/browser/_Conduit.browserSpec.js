'use strict';

var when = require('when');

var _Conduit = require('./../../src/_Conduit');

describe('The _Conduit module', function() {

    it('provides the "sortAsync" function', function() {
        //noinspection JSUnresolvedVariable
        expect(_Conduit.sortAsync).to.be.a('function');
    });

    describe('when attempting a sort', function() {
        var sortSpec, promise;

        beforeEach(function() {
            sortSpec = {
                comparator: 'name',
                data: [
                    {id: 2, name: "two", first: 0, second: 2},
                    {id: 1, name: "one", first: 1, second: 0},
                    {id: 3, name: "three", first: 1, second: 2}
                ]
            };

            _Conduit.setUnderscorePath('/base/node_modules/underscore/underscore.js');
            promise = _Conduit.sortAsync(sortSpec);
        });

        it('should return a promise from "sort"', function() {
            //noinspection BadExpressionStatementJS,JSUnresolvedFunction,JSUnresolvedVariable
            expect(when.isPromiseLike(promise)).to.be.true;
        });

        it('should resolve the promise to an array', function() {
            //noinspection JSUnresolvedFunction,JSUnresolvedVariable
            expect(promise).to.eventually.be.an('array');
        });

        it('should resolve to an array of the same length', function() {
            //noinspection JSUnresolvedVariable
            expect(promise).to.eventually.have.length(3);
        });

        it('should resolve the data sorted by the comparator', function(done) {
            // chaiAsPromised/Things doesn't appear to support array order testing, so ...
            promise.then(function(sorted) {
                expect(sorted[0].name).to.equal('one');
                done();
            });
        });
    });});