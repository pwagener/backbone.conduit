/**
 * Module for recording the start/stop time of arbitrary # of events
 */

var util = require("util");
var _ = require("underscore");

function start(eventName) {
    var newEvent = {
        name: eventName,
        finished: false
    };

    newEvent.start = new Date().getTime();
    return  newEvent;
}

function end(event) {
    event.end = new Date().getTime();
    event.finished = true;
    event.duration = event.end - event.start;

    return event;
}

function logEvent(event) {
    console.log(util.format("%s took %d ms", event.name, event.duration));
}

function logComparison(events) {
    if (!events.length) {
        throw new Exception("Provide an array of events to compare");
    }

    var sorted = _.sortBy(events, function(event) { return -1 * event.duration });
    var fastest = _.last(sorted);

    var comparisons = [];
    console.log("Results:");
    _.each(sorted, function(event) {
        console.log(util.format("    %s took %d ms", event.name, event.duration));

        if (event !== fastest) {
            var percentFaster = Math.round((1 - fastest.duration / event.duration) * 100);
            comparisons.push(util.format("    %s is %d% faster than %s", fastest.name, percentFaster, event.name));
        }
    });

    console.log("---");
    console.log(util.format("Fastest: %s at %d ms", fastest.name, fastest.duration));
    console.log("---");

    console.log("Comparisons:");
    _.each(comparisons, function(comparison) {
        console.log(comparison);
    });
}

module.exports = {
    start: start,
    end: end,
    logEvent: logEvent,
    logComparison: logComparison
};