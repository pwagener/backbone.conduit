/**
 * Module for recording the start/stop time of arbitrary # of events
 */

var util = require("util");

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

function logDifference(eventOne, eventTwo) {
    var faster, slower;
    if (eventOne.duration > eventTwo.duration) {
        faster = eventTwo;
        slower = eventOne;
    } else {
        faster = eventOne;
        slower = eventTwo
    }

    var percentFaster = Math.round((1 - faster.duration / slower.duration) * 100);

    console.log("%s is %d% faster than %s", faster.name, percentFaster, slower.name);
}


module.exports = {
    start: start,
    end: end,
    logEvent: logEvent,
    logDifference: logDifference
};

