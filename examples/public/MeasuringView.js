/*

Hello intrepid Javascript-or!  Many thanks for looking at the source.

Just bear in mind if you're looking for the Collection performance magic, it's not in
this file.  This is just glue & rendering to make the examples not look too terrible.  I
make no claims on this being good code; I'm a data guy.

Check out the ConduitCollection.js and SparseCollection.js
files to see how this example leverages Backbone.Conduit.

Happy Browsing!
 */



/**
 * Utility for getting the current time in millis
 * @return {number}
 */
function now() {
    return new Date().getTime();
}

/**
 * This collection is used internally by the MeasuringView to keep track of when
 * things happen.
 */
var TimingEventCollection = Backbone.Collection.extend({

    comparator: function(item) {
        return item.get('end');
    },

    beginning: null,

    initialize: function(ignored) {
        this.beginning = now();
    },

    annotate: function(label) {
        this.add({
            start: now(),
            end: now(),
            name: label,
            annotation: true
        });
    },

    startCycle: function(label) {
        if (this.cycle) {
            throw new Error('Two cycles run at the same time');
        }

        this.cycle = {
            name: label,
            summary: true,
            start: now()
        }
    },

    endCycle: function() {
        var end = now();
        var cycleEvent = _.extend(this.cycle, {
            end: now(),
            duration: end - this.cycle.start
        });
        this.add(cycleEvent);
        delete this.cycle;
    },

    startEvent: function(eventName, eventData) {
        var eventId = _.uniqueId('e');
        var event = _.extend({
            name: eventName,
            start: now(),
            eventId: eventId
        }, eventData);

        this.add(event);
        return eventId;
    },

    endEvent: function(eventId) {
        var end = now();

        var event = this.findWhere({ eventId: eventId });
        if (!event) {
            throw new Error('Could not find event: ' + eventId);
        }

        var start = event.get('start');
        var duration = end - start;
        var delayBeforeStart = start - this.beginning;

        event.set({
            end: end,
            duration: duration,
            delayBeforeStart: delayBeforeStart
        });

        return event;
    }
});

/**
 * This view is a sub-view of the MeasuringView that keeps a log of when things happen.
 */
var TimingLogView = Backbone.View.extend({

    initialize: function() {
        var source = $('#timing-log-template').html();
        this.template = Handlebars.compile(source);

        // Re-render whenever a new event occurs
        this.listenTo(this.collection, 'add', this.render);
        this.listenTo(this.collection, 'change:hung', this.render);
    },

    render: function() {
        var eventsData = [];

        this.collection.each(function(event) {
            var currentEvent = _.extend({
                finished: event.has('end')
            }, event.toJSON());

            eventsData.push(currentEvent);

            // If this event hung the browser, add an annotation for that.
            if (currentEvent.hung) {
                var duration = moment.duration(currentEvent.hungTime);
                eventsData.push({
                    annotation: true,
                    message: 'Looks like "' + currentEvent.name + '" hung the browser for ' +
                    duration.as('seconds') + ' seconds'
                });
            }
        });

        var content = this.template({
            events: eventsData
        });
        this.$el.html(content);

        return this;
    }
});

// The meta-data about the data files we offer
var demoData = [
    {
        file: 'restaurant-scores-5000.json',
        label: '5K Items'
    },
    {
        file: 'restaurant-scores-20000.json',
        label: '20K Items'
    },
    {
        file: 'restaurant-scores-100000.json',
        label: '100K Items'
    },
    {
        file: 'restaurant-scores-221000.json',
        label: '221K Items'
    }
];
/**
 * This is a sub-view used by MeasuringView to manage the drop-down that contains
 * the data files we could choose.
 */
var ItemDropdownView = Backbone.View.extend({

    events: {
        'click a': 'onItemClick'
    },

    initialize: function() {
        var source = $('#dropdown-template').html();
        this.template = Handlebars.compile(source);
        this.current = _.first(demoData);
    },

    render: function() {
        var viewData = {
            cid: 'menu-' + this.cid,
            currentLabel: this.current.label,
            items: []
        };
        _.each(demoData, function(entry) {
            viewData.items.push(entry);
        });

        var html = this.template(viewData);
        this.$el.html(html);

        return this;
    },

    onItemClick: function(event) {
        var target = event.target;
        var file = this.$(target).data('file');
        this.current = _.findWhere(demoData, { file: file });
        this.render();

        event.preventDefault();
        return true;
    },

    getCurrent: function() {
        return this.current;
    }

});

/**
 * This is the view that we expose globally.  It handles the interaction between the
 * 'Run' button & the event table.
 */
var MeasuringView = window.MeasuringView = Backbone.View.extend({

    events: {
        'click a.btn-primary': 'onButtonClick'
    },

    initialize: function(options) {
        this.button = this.$('.description .btn-primary');
        this.buttonLabel = this.button.find('.buttonText');
        this.buttonIcon = this.button.find('.glyphicon');

        // Listen for a variety of data events so we can measure them.
        this.listenTo(this.collection, 'parseStart', this._onParseStart);

        this.title = options.title;
    },

    render: function() {
        if (!this.rendered) {
            // Create & prime our Timing Log
            this.timing = new TimingEventCollection();
            var timingLog = new TimingLogView({
                el: this.$('.measurement'),
                collection: this.timing
            });
            timingLog.render();

            this.listenTo(this.timing, 'add', _.debounce(function() {
                    var $timingLog = timingLog.$el;
                    var scrollTarget = $timingLog.get(0).scrollHeight;
                    $timingLog.stop().animate({ scrollTop: scrollTarget }, '500', 'swing');
            }, 50));

            var itemDropDown = this.itemDropDown = new ItemDropdownView({
                collection: this.collection,
                el: this.$('.menuContainer')
            });
            itemDropDown.render();

            this.rendered = true;
        }
    },

    _getEventOptions: function(event) {
        return {
            async: _.contains(this.collection.asyncDataEvents, event)
        }
    },

    onButtonClick: function(event) {
        // Disable Clicks
        this.undelegateEvents();

        this.buttonLabel.text('Fetch Data');
        this.button.addClass('disabled');

        this.buttonIcon.removeClass('glyphicon-play glyphicon-repeat');
        this.buttonIcon.addClass('loading');

        // Fetch the data file to kick things off

        var dataFile = this.itemDropDown.getCurrent().file;

        this._startDataLoadChain(dataFile);

        event.preventDefault();
        return true;
    },

    _startDataLoadChain: function(dataFile) {
        this._requestDataEvent = this.timing.startEvent('Fetch & Parse Data', this._getEventOptions('fetch'));
        this.collection.fetchDataFile(dataFile);
        this.listenToOnce(this.collection, 'dataReceived', this._onDataReceived);
    },

    _onDataReceived: function() {
        this.timing.endEvent(this._requestDataEvent);
        this.timing.startCycle('Time to Create, Filter & Sort');
        this.listenToOnce(this.collection, 'sync', this._onSync);
        this._modelsCreatedEvent = this.timing.startEvent('Create Models', this._getEventOptions('create'));
    },

    _onSync: function() {
        var timing = this.timing;
        timing.endEvent(this._modelsCreatedEvent);

        // Now that we have parsed/sync'ed data:  filter it
        var collection = this.collection;
        var event = timing.startEvent('Filter Collection', this._getEventOptions('filter'));
        var filteredModels = collection.filterToMostRecent();
        // Set the filtered models
        if (collection instanceof ConduitCollection) {
            collection.refill(filteredModels);
        } else {
            collection.reset(filteredModels);
        }
        timing.endEvent(event);

        // Next up:  sorting
        event = timing.startEvent('Sort Collection', this._getEventOptions('sort'));
        collection.sortByNameAndDate();
        timing.endEvent(event);

        var summary = collection.getSummary(3);
        this._measurementComplete(summary);
    },

    _measurementComplete: function(summary) {
        var length = this.collection.length;
        this.timing.annotate('Filtered/Sorted Collection has <strong>' + length + '</strong> items.  ' +
            'The first three entries:<br/>' + summary);

        this.timing.endCycle();

        this.button.removeClass('disabled');
        this.buttonIcon.removeClass('loading');
        this.buttonIcon.addClass('glyphicon-repeat');
        this.buttonLabel.text('Run This Again');

        this.button.blur();

        this.delegateEvents();
    }
});

// This view is used for the SparseCollection to show the different event sequence
//noinspection JSUnusedGlobalSymbols
var SparseMeasuringView = window.SparseMeasuringView = window.MeasuringView.extend({

    /*
     * We override '_startDataLoadChain' and '_onSync' from the regular view, because the SparseCollection
     * does some things in a different sequence.  For instance, model creation doens't occur
     * until the very last moment.
     */

    _startDataLoadChain: function(dataFile) {

        // First reset any sorting from the previous run
        var self = this;
        this.collection.resetProjection().then(function() {
            self._requestDataEvent = self.timing.startEvent('Fetch Data', self._getEventOptions('fetch'));
            self.collection.fetchDataFile(dataFile);
            self.listenToOnce(self.collection, 'sync', self._onSync);
        });
    },

    _onSync: function() {
        var timing = this.timing;
        timing.endEvent(this._requestDataEvent);
        this.timing.startCycle('Time to Create, Filter & Sort');

        // Next Filter the items
        var self = this;
        var event = timing.startEvent('Filter Collection', this._getEventOptions('filter'));
        var collection = this.collection;
        collection.filterAsync().then(function() {
            timing.endEvent(event);

            // next sort models
            event = timing.startEvent('Sort Collection', self._getEventOptions('sort'));
            return collection.sortAsync();
        }).then(function() {
            timing.endEvent(event);

            // Finally get the summary, which creates the models
            event = timing.startEvent('Create Models', self._getEventOptions('create'));
            return collection.getSummaryPromise(3);
        }).then(function(summary) {
            timing.endEvent(event);
            self._measurementComplete(summary);
        });
    }
});