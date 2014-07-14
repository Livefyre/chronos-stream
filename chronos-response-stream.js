module.exports = ChronosResponseStream;

var inherits = require('inherits');
var qs = require('querystring');
var url = require('url');
var PagedHttpStream = require('./paged-http-stream');
var chronosRequest = require('./chronos-request');

/**
 * A Readable stream of response strings from Chronos, paging back in time
 * @param topic {string} Chronos topic to stream responses about
 * @param opts {object} Stream options
 */
function ChronosResponseStream(topic, opts) {
  PagedHttpStream.call(this, opts);
  this.topic = topic;
  this.environment = opts.environment;
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
  if (res && String(res.statusCode).charAt(0) !== '2') {
    throw new Error('Non-2xx Chronos response: '+res.statusCode);
  }
  // after first request, inspect the last request for the cursor
  if (req && body) {
    obj = JSON.parse(body);
    cursor = obj.meta && obj.meta.cursor;
  }
  return chronosRequest({
    topic: this.topic,
    cursor: cursor,
    token: this._authCredentials,
    environment: this.environment
  });
};
