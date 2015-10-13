'use strict';

var _ = require('underscore');
var when = require('when');

var context = require('../../src/worker/managedContext');

describe('The managedContext module', function() {
    var global;

    var callContextMethod = function(methodName, args, requestId) {
        requestId = requestId || _.uniqueId('fakeRequest');
        global.onmessage({
            data: {
                method: methodName,
                args: args,
                requestId: requestId
            }
        });
    };

    beforeEach(function() {
        // Object we use to represent the global context in tests
        global = { };
        context.setAsGlobal(global);
    });

    it('returns an object', function() {
        expect(context).to.be.an('object');
    });

    it('Installs an "onmessage" handler', function() {
        expect(global.onmessage).to.be.a('function');
    });

    it('provides its configuration to the ConduitWorker namespace', function() {
        var config = {
            foo: 'bar',
            baz: 100
        };
        context.configure(config);

        expect(global.ConduitWorker.config).to.eql(config);
    });

    it('imports scripts provided as components in the configuration', function() {
        global.importScripts = this.sinon.spy();

        context.configure({
            components: [ 'one', 'two', 'three']
        });

        expect(global.importScripts.callCount).to.equal(3);
    });

    it('does not print debug messages when not configured', function() {
        global.console = {
            log: this.sinon.spy()
        };

        context.configure({});
        expect(global.console.log.callCount).to.equal(0);
    });

    it('prints debug messages when configured', function() {
        global.console = {
            log: this.sinon.spy()
        };

        context.configure({
            debug: true
        });
        expect(global.console.log.callCount).to.be.greaterThan(0);
    });

    // crappy test, but I don't like mocking out "require(...)"
    it('provides a "enableCoreHandlers" method', function() {
        expect(context.enableCoreHandlers).to.be.a('function');
    });

    it('Installs a "ConduitWorker" namespace', function() {
        expect(global.ConduitWorker).to.be.an('object');
    });

    describe('when configuring components', function() {
        var ConduitWorker;

        beforeEach(function() {
            // We stub out importScripts so we can tell it to return fixtures
            // later.
            context.enableCoreHandlers();
            ConduitWorker = global.ConduitWorker;
        });

        it('begins with "ping" and "configure" handlers', function() {
            expect(ConduitWorker.handlers).to.have.property('ping');
            expect(ConduitWorker.handlers).to.have.property('configure');
        });

        it('refuses to register a handler without a "name"', function() {
            // Ugly, but this allows us to act like we're importing a remote script &
            // executing it.
            global.importScripts = function() {
                ConduitWorker.registerComponent([
                    { method: function() { } }
                ]);
            };
            var bound = _.bind(context.configure, context, {
                components: [ 'foo' ]
            });

            expect(bound).to.throw(Error);
        });

        it('refused to register a component without a method', function() {
            global.importScripts = function() {
                ConduitWorker.registerComponent({
                    name: 'foo',
                    methods: [
                        { name: 'foo' }
                    ]
                })
            };
            var bound = _.bind(context.configure, context, {
                components: [ 'foo' ]
            });

            expect(bound).to.throw(Error);
        });
    });

    describe('when calling a configured component', function() {
        var postMessageSpy, fooHandler, bazHandler;

        beforeEach(function() {
            // Nasty set of configuration to make it look like we've configured
            // things...
            postMessageSpy = this.sinon.spy();
            global.postMessage = postMessageSpy;

            fooHandler = {
                name: 'foo',
                method: function() {
                    return { foo: "bar" };
                }
            };

            bazHandler = {
                name: 'baz',
                method: function() {
                    return {
                        then: function(callback) {
                            callback({
                                baz: 'resolved'
                            });

                            return {
                                catch: function() {
                                }
                            }
                        }
                    };
                }
            };

            context.enableCoreHandlers();

            global.importScripts = function() {
                global.ConduitWorker.registerComponent({
                    name: 'testComponents',
                    methods: [
                        fooHandler,
                        bazHandler
                    ]
                });
            };

            context.configure({
                components: [ 'ignored' ]
            });
        });

        it('response via "postMessage"', function() {
            callContextMethod(fooHandler.name);
            expect(postMessageSpy.callCount).to.equal(1);
        });

        it('provides the return value via "postMessage"', function() {
            callContextMethod(fooHandler.name);
            var callArgs = postMessageSpy.getCall(0).args;
            var response = callArgs[0];
            expect(response).to.have.property('result');
            var result = response.result;
            expect(result).to.have.property('foo', 'bar');
        });

        it('provides the resolved value if the handler returns a promise', function() {
            callContextMethod(bazHandler.name);
            expect(postMessageSpy.callCount).to.equal(1);
            var callArgs = postMessageSpy.getCall(0).args;
            var response = callArgs[0];
            expect(response).to.have.property('result');
            var result = response.result;
            expect(result).to.have.property('baz', 'resolved');
        });

        it('returns an Error when calling an unregistered handler', function() {
            callContextMethod('bleah');

            var callArgs = postMessageSpy.getCall(0).args;
            var response = callArgs[0];
            expect(response).to.not.have.property('result');
            var error = response.error;
            expect(error).to.be.an.instanceOf(Error);
            expect(error.message).to.contain("'bleah'");
        });
    });
});