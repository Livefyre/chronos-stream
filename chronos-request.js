var qs = require('querystring');
var url = require('url');

/**
 * Create a request object that can be passed to require('http').request in
 * order to request the Chronos renderer for a given topic
 * If a cursor object is provided, an 'until' param will be added to page
 * back in time.
 * @param opts {object} options
 * @param opts.environment {string} dev|qa|uat|prod
 * @param opts.token {string} LFToken to make request with
 * @param opts.topic {string} Chronos topic to get activities about
 * @param opts.cursor {object} response.meta.cursor value from a response
 */
module.exports = exports = function chronosRequest(opts) {
  opts = opts || {};
  var topic = opts.topic;
  var token = opts.token;
  var cursor = opts.cursor;
  var environment = opts.environment;
  var chronosUrl = 'http://' + exports.host(environment) + '/api/v4/timeline/';
  var query = {
    resource: topic
  };
  if (cursor) {
    if ( ! cursor.hasPrev) {
      // we're done
      return;
    }
    query['until'] = cursor.prev;
  }
  if (token) {
    query['lftoken'] = token;
  }
  if (Object.keys(query)) {
    chronosUrl += '?' + qs.stringify(query);
  }
  // great we have a url, but we actually want to return
  // an options object that can be passed to require('http').request
  var options = url.parse(chronosUrl);
  options.withCredentials = false;
  return options;
};

var chronosEnvironments = {
  'fyre': 'bootstrap.fyre',
  'qa': 'bootstrap.qa-ext.livefyre.com',
  'uat': 'bootstrap.t402.livefyre.com',
  'production': 'bootstrap.livefyre.com' 
};

/**
 * Given an environment string, return the proper host to request Chronos
 * @param env {string} dev|qa|uat|prod
 */
exports.host = function (env) {
  env = env || 'production';
  return chronosEnvironments[env];
}
