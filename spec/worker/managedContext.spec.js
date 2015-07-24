'use strict';

var _ = require('underscore');

var context = require('../../src/worker/managedContext');

describe('The managedContext module', function() {
    var global;

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
        var postMessageSpy, fooHandler, ConduitWorker;

        beforeEach(function() {
            // Nasty set of configuration to make it look like we've configured
            // things...
            postMessageSpy = this.sinon.spy();
            global.postMessage = postMessageSpy;

            fooHandler = {
                name: 'foo',
                method: function() {
                    return {
                        foo: "bar"
                    };
                }
            };

            context.enableCoreHandlers();
            ConduitWorker = global.ConduitWorker;

            global.importScripts = function() {
                ConduitWorker.registerComponent({
                    name: 'foo',
                    methods: [
                        fooHandler
                    ]
                });
            };

            context.configure({
                components: [ 'ignored' ]
            });

            global.onmessage({
                data: { method: fooHandler.name }
            });

        });

        it('response via "postMessage"', function() {
            expect(postMessageSpy.callCount).to.equal(1);
        });

        it('provides the return value via "postMessage"', function() {
            var callArgs = postMessageSpy.getCall(0).args;
            var response = callArgs[0];
            expect(response).to.have.property('foo', 'bar');
        });

        it('returns an Error when calling an unregistered handler', function() {
            postMessageSpy.reset();
            global.onmessage({ data: {
                method: 'baz'
            }});

            var callArgs = postMessageSpy.getCall(0).args;
            var response = callArgs[0];
            expect(response).to.be.an.instanceOf(Error);
            expect(response.message).to.contain("'baz'");
        });
    });
});