
var WrappedWorker = require('../src/WrappedWorker');
var makeMockWorker = require('./makeMockWorker');

describe('The WrappedWorker module', function () {
    
    var SavedWorker;
    var MockWorker;
    var fileLocation;
    beforeEach(function () {
        fileLocation = '/path/to/worker-file.js';
        SavedWorker = WrappedWorker._Worker;
        MockWorker = makeMockWorker(this.sinon);
        WrappedWorker._Worker = MockWorker;
    });
    afterEach(function () {
        WrappedWorker._Worker = SavedWorker;
        WrappedWorker._workerQueueList = [];
    });

    it('provides a constructor', function () {
        expect(WrappedWorker).to.be.a('function');
    });

    it('requires a file path for the worker', function (done) {
        try {
            new WrappedWorker({});
        } catch (err) {
            expect(err).to.be.instanceOf(Error);
            done();
        }
    });
    
    it('should spawn a worker instance', function () {
        new WrappedWorker({ workerFilePath: fileLocation });
        expect(MockWorker.calledOnce);
    });
    
    describe('when a message is sent', function () {
        var wrapped;
        beforeEach(function () {
            wrapped = new WrappedWorker({ workerFilePath: fileLocation });
            wrapped._worker.setResponse({ response: 'some response'});
        });
        it('should return a promise that resolves when the worker responds', function (done) {
            wrapped.send({ message: 'some message' }).then(function (response) {
                expect(response.data.result).to.equal('some response');
                done();
            }).catch(done);
        });
    });
    
    describe('when multiple messages are sent', function () {
        var wrapped;
        beforeEach(function () {
            wrapped = new WrappedWorker({ workerFilePath: fileLocation });
        });
        it('should wait for previous messages to get responses before sending', function (done) {
            wrapped._worker.setResponse({ method: 'one', response: 'some response'});
            wrapped._worker.setResponse({ method: 'two', response: 'another response'});
 
            var promOne = wrapped.send({ method: 'one' });
            var promTwo;
            
            promOne.then(function () {
                expect(wrapped._worker.postMessage.calledOnce).to.equal(true);
                expect(wrapped._worker.postMessage.firstCall.args[0].method).to.equal('one');
                return promTwo;
            }).then(function () {
                expect(wrapped._worker.postMessage.calledTwice).to.equal(true);
                expect(wrapped._worker.postMessage.secondCall.args[0].method).to.equal('two');
                done();
            }).catch(done);

            promTwo = wrapped.send({ method: 'two' });
            
        });
    });
    
    describe('when terminated', function () {
        var wrapped;
        beforeEach(function () {
            wrapped = new WrappedWorker({ workerFilePath: fileLocation });
        });
        it('should invoke "terminate" on the worker', function (done) {
            wrapped.terminate().then(function () {
                expect(wrapped._worker.terminate.calledOnce).to.equal(true);
                done();
            }).catch(done);
        });
    });

    describe('the SharedWorker static sub-module', function () {

        var wrappedA;
        var wrappedB;
        var worker;
        beforeEach(function () {
            wrappedA = new WrappedWorker.SharedWorker({ workerFilePath: fileLocation });
            wrappedB = new WrappedWorker.SharedWorker({ workerFilePath: fileLocation });
            worker = wrappedA._worker;
        });

        describe('when instantiated', function () {
            it('should use the same actual worker instance for each wrapped worker instance', function () {
                expect(MockWorker.calledOnce).to.equal(true);
                expect(wrappedA._worker).to.equal(wrappedB._worker);
            });
        });

        describe('when messages are sent from each wrapped worker instance', function (done) {
            it('should wait until each message resolves in the order that they are sent before sending another message', function () {
                worker.setResponse({ method: 'one', response: 'some response'});
                worker.setResponse({ method: 'two', response: 'another response'});
                var promA = wrappedA.send({
                    method: 'one'
                });
                var promB = wrappedB.send({
                    method: 'two'
                });
                
                promA.then(function () {
                    expect(worker.postMessage.calledOnce).to.equal(true);
                    expect(worker.postMessage.firstCall.args[0].method).to.equal('one');
                    return promB;
                }).then(function () {
                    expect(worker.postMessage.calledTwice).to.equal(true);
                    expect(worker.postMessage.secondCall.args[0].method).to.equal('one');
                    done();
                }).catch(done);

            });
        });


    });

});
