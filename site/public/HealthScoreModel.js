/**
 * This provides the Backbone.Model for our sample data:  restaurant scores
 * in NYC over the past few years.
 */

var HealthScoreModel = window.HealthScoreModel = Backbone.Model.extend({

    /**
     * Simple method to summarize this health score
     * @return {string} A summary
     */
    summarize: function() {
        return this.get('name') + ' on ' + this.get('date') +
            ' received grade: ' + this.get('grade');
    }

});