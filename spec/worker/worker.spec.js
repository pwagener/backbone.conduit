'use strict';

var _ = require('underscore');
var worker = require('./../../src/worker/worker');

describe('The worker/worker module', function() {

    it('provides an "enableHandlers" function', function() {
        expect(worker.enableHandlers).to.be.a('function');
    });

    it('refuses to register a handler without a "name"', function() {
        var boundMethod = _.bind(worker.enableHandlers, worker, {},  [{
            method: function() { }
        }]);

        //noinspection BadExpressionStatementJS
        expect(boundMethod).to.throw;
    });

    it('refuses to register a handler without a "method"', function() {
        var boundMethod = _.bind(worker.enableHandlers, worker, {},  [{
            name: "wontWork"
        }]);

        expect(boundMethod).to.throw(Error);
    });

    describe('after registering a handler', function() {
        var mockGlobal, postMessageSpy;

        beforeEach(function() {
            postMessageSpy = this.sinon.spy();
            mockGlobal = {
                postMessage: postMessageSpy
            };

            var fooHandler = {
                name: 'foo',
                method: function(options) {
                    return {
                        foo: "bar"
                    };
                }
            };
            worker.enableHandlers(mockGlobal, [
                fooHandler
            ]);

        });

        describe('and calling it', function() {
            beforeEach(function() {
                mockGlobal.onmessage({
                    data: {
                        method: "foo"
                    }
                });
            });

            afterEach(function() {
                postMessageSpy.reset();
            });

            it('responds via "postMessage"', function() {
                //noinspection BadExpressionStatementJS
                expect(postMessageSpy.called).to.be.true;
            });

            it('provides the return value via "postMessage"', function() {
                var callArgs = postMessageSpy.getCall(0).args;
                var response = callArgs[0];
                expect(response).to.be.an('object');
                expect(response.foo).to.equal('bar');
            });
        });

        describe('when calling an unregistered handler', function() {
            beforeEach(function() {
                mockGlobal.onmessage({
                    data: {
                        method: "baz"
                    }
                });
            });

            afterEach(function() {
                postMessageSpy.reset();
            });

            it('returns an Error object', function() {
                var callArgs = postMessageSpy.getCall(0).args;
                var response = callArgs[0];
                expect(response).to.be.an.instanceOf(Error);
                expect(response.message).to.contain("'baz'");
            });

        });


    });

});