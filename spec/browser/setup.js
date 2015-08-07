'use strict';

// loaded by karma
var sinon = window.sinon;
delete window.sinon;
var chai = require('chai');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require('chai-as-promised');
var Backbone = require('backbone');
var Conduit = require('src/index');

var mockServer = require('./../mockServer');
mockServer.captureAjax(Backbone.$);

// The location of the worker file, from the tests' perspective
window.workerLocation = '/base/dist';

// load specs
require('./config.browserSpec.js');
require('./QuickCollection.browserSpec.js');
require('./haul.browserSpec.js');

window.expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

function getSampleData() {
    return[
        {id: 2, name: "two", first: 0, second: 2},
        {id: 1, name: "one", first: 1, second: 0},
        {id: 3, name: "three", first: 1, second: 2}
    ];
}

beforeEach(function () {
    this.sinon = sinon.sandbox.create();

    this.getSampleData = getSampleData;

    this.mute = function(funcToMute) {
        return function() {
            funcToMute();
        }
    }
});

afterEach(function () {
    this.sinon.restore();
});
