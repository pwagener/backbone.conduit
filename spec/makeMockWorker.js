var _ = require('underscore');

/**
 * Method to create a Worker constructor that is mocked out for testing the Boss.
 * These unit tests can then run via Node instead of in a browser.
 * @param sinon The sinon instance to use for mocking
 * @param response The response the worker should provide asynchronously
 * from any "postMessage" call.
 * @return {Function} The mocked-out Worker constructor
 */
function makeMockWorker(sinon, response) {
    //noinspection UnnecessaryLocalVariableJS
    var MockWorker = sinon.spy(function () {
        // Spy on our "postMessage" impl
        sinon.spy(this, 'postMessage');

        if (response) {
            this.defaultResponse = response;
        }
        
        this.responses = {};
    });

    // Implement postMessage to call 'onmessage' after a short delay.
    MockWorker.prototype.postMessage = function(message) {
        var self = this;
        var methodName = message.method;
        _.delay(function() {
            self.onmessage({
                data: {
                    requestId: message.requestId,
                    result: self.getResponse(methodName)
                }
            });
        }, 50);
    };

    MockWorker.prototype.terminate = sinon.spy();

    MockWorker.prototype.setResponse = function(details) {
        this.responses[details.method] = details.response;
    };

    MockWorker.prototype.getResponse = function(methodName) {
        return this.responses[methodName] || this.defaultResponse;
    };

    return MockWorker;
}

module.exports = makeMockWorker;
