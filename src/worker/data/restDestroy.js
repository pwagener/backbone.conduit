'use strict';

/**
 * Implement DELETE REST-ful calls
 */

var _ = require('underscore');
var getDataUtils = require('./getDataUtils');
var nanoAjax = require('nanoajax');

module.exports = {
    name: 'restDestroy',

    bindToWorker: true,

    /**
     * Implementation of 'destroy'
     * @param data The data that indicates what to DELETE.  This must include a value for
     * the ID key of the data set (specified in data.initStore; defaults to "id").
     * @param options Other details about the deletions, including:
     *   - baseUrl (Required) The base URL to issue the DELETE command.  Will be appended
     *     with the ID.
     *   - headers Any headers to include with the request.
     */
    method: function(data, options) {
        var dataUtils = getDataUtils(this._currentObjectId);
        return new Promise(function(resolve, reject) {
            if (!options.baseUrl) {
                reject(new Error('Destroy requires a "baseUrl"'));
                return;
            }

            var idKey = dataUtils.getIdKey();
            var id = data[idKey];
            var hasId = _.isUndefined(id) ? false : true;

            var headers = _.defaults({}, options.headers, {
                'Accept': 'application/json, text/javascript, */*; q=0.01'
            });

            if (hasId) {
                var url = options.baseUrl + '/' + id;
                nanoAjax.ajax({
                    url: url,
                    method: 'DELETE',
                    headers: headers
                }, function(code, responseText) {
                    var response;
                    if (_.isString(responseText)) {
                        try {
                            response = JSON.parse(responseText);
                        } catch (err) {
                            response = responseText;
                        }
                    }

                    if (code < 400) {
                        dataUtils.removeById(id);
                        resolve(response);
                    } else {
                        var errorMessage;
                        if (response && response.message) {
                            errorMessage = response.message;
                        } else if (_.isString(response)) {
                            errorMessage = response;
                        } else {
                            errorMessage = 'Error code: ' + code;
                        }

                        var error = new Error(errorMessage);
                        error.code = code;
                        reject(error);
                    }
                });
            } else {
                reject(new Error('Item to delete did not have an ID'));
            }
        });
    }
};
