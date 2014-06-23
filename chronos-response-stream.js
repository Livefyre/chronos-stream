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
  PagedHttpStream.call(this, chronosRequest(topic), opts);
  this.topic = topic;
}
inherits(ChronosResponseStream, PagedHttpStream);

/**
 * Required by PagedHttpStream.
 * Will be provided the request, response, and body from the previous request
 * Return the absolute URL for the next request.
 */
ChronosResponseStream.prototype._getNextRequest = function (req, res, body) {
  var obj = JSON.parse(body);
  var cursor = obj.meta && obj.meta.cursor;
  return chronosRequest(this.topic, cursor);
};

/**
 * Create a full, absolute URL to the Chronos renderer for a given topic
 * If a cursor object is provided, an 'until' param will be added to page
 * back in time.
 * @param topic {string} Chronos topic to get activities about
 * @param cursor {object} response.meta.cursor value from a response
 */
function chronosRequest(topic, cursor) {
  var template = 'http://saturn.qa-ext.livefyre.com/api/v4/renderer/{topic}';
  var chronosUrl = template.replace('{topic}', topic);
  if (cursor) {
    if ( ! cursor.hasPrev) {
      // we're done
      return;
    }
    chronosUrl += '?' + qs.stringify({ until: cursor.prev });
  } 
  var options = url.parse(chronosUrl);
  options.withCredentials = false;
  return options;
}
