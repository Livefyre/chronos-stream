module.exports = ChronosResponseStream;

var inherits = require('inherits');
var qs = require('querystring');
var url = require('url');
var PagedHttpStream = require('./paged-http-stream');

/**
 * A Readable stream of response strings from Chronos, paging back in time
 * @param topic {string} Chronos topic to stream responses about
 * @param opts {object} Stream options
 */
function ChronosResponseStream(topic, opts) {
  PagedHttpStream.call(this, opts);
  this.topic = topic;
}
inherits(ChronosResponseStream, PagedHttpStream);

/**
 * Provide auth credentials (e.g. lftoken)
 * These are required for certain topics
 */
ChronosResponseStream.prototype.auth = function (creds) {
  this._authCredentials = creds;
  return this;
};

/**
 * Required by PagedHttpStream.
 * Will be provided the request, response, and body from the previous request
 * Return the absolute URL for the next request.
 */
ChronosResponseStream.prototype._getNextRequest = function (req, res, body) {
  var obj;
  var cursor;
  // after first request, inspect the last request for the cursor
  if (req) {
    obj = JSON.parse(body);
    cursor = obj.meta && obj.meta.cursor;
  }
  return chronosRequest(this.topic, cursor, this._authCredentials);
};

/**
 * Create a full, absolute URL to the Chronos renderer for a given topic
 * If a cursor object is provided, an 'until' param will be added to page
 * back in time.
 * @param topic {string} Chronos topic to get activities about
 * @param cursor {object} response.meta.cursor value from a response
 */
function chronosRequest(topic, cursor, token) {
  var chronosUrl = 'http://bootstrap.qa-ext.livefyre.com/api/v4/timeline/';
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
}
