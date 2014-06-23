module.exports = PagedHttpStream;

var Readable = require('stream-objectmode/src/readable');
var http = require('http');
var inherits = require('inherits');

/**
 * Base class for streaming response strings from an HTTP Collection that is
 * paged.
 * You just need to implement _getNextUrl.
 */
function PagedHttpStream(url, opts) {
  opts = opts || {};
  Readable.call(this, opts);
  this._nextUrl = url;
}
inherits(PagedHttpStream, Readable);

/**
 * stream.Readable protocol
 * This is called whenever data should be fetched from upstream.
 * In this case, make the next request to Chronos
 */
PagedHttpStream.prototype._read = function (x, done) {
  var self = this;
  var url = this._nextUrl;
  if ( ! url) {
    // we're done
    return this.push(null);
  }
  this._request(url, function (res) {
    var buffer = '';
    if (res.statusCode !== 200) {
      return self.emit('error', new Error(res.statusCode));
    }
    res.on('error', function (e) {
      console.log('response error', e);
    })
    res.on('data', function (d) {
      buffer += d;
    });
    res.once('end', function () {
      self._nextUrl = self._getNextUrl(url, res, buffer);
      self.push(buffer);
    });
  });
};

/**
 * Make an HTTP request
 */
PagedHttpStream.prototype._request = function (options, cb) {
  this.emit('request', options);
  if (typeof options === 'string') {
    return http.get(options, cb);
  }
  http.request(options, cb);
};

/**
 * Return the next URL that should be requested
 */
PagedHttpStream.prototype._getNextUrl = function (req, res, body) {
  throw new Error('PagedHttpStream#_getNextUrl not implemented');
};

