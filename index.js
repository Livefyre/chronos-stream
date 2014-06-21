module.exports = ChronosStream;

var Readable = require('stream-objectmode/src/readable');
var http = require('http');
var inherits = require('inherits');
var extend = require('util-extend');
var qs = require('querystring');

function ChronosStream(opts) {
  opts = (typeof opts === 'string') ? { topic: opts } : opts || {};
  opts = extend(opts || {}, {
    objectMode: true
  });
  Readable.call(this, opts);
  this.topic = opts.topic;
  this._urlForCursor = chronosUrl.bind({}, this.topic);
  this._cursor = null;
}
inherits(ChronosStream, Readable);

/**
 * stream.Readable protocol
 * This is called whenever data should be fetched from upstream.
 * In this case, make the next request to Chronos
 */
ChronosStream.prototype._read = function (x, done) {
  var self = this;
  var url = this._urlForCursor(this._cursor);
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
      onResponse(buffer);
    });
  });
  // handle text response body
  function onResponse(response) {
    var obj = JSON.parse(response);
    var datas = obj.data;
    var cursor = obj.meta && obj.meta.cursor;
    self._cursor = cursor;
    // ensure datas is an array, since we'll apply .push to it
    if ( ! Array.isArray(datas)) {
      datas = [datas];
    }
    self.push.apply(self, datas);
  }
};

ChronosStream.prototype._request = function (options, cb) {
  this.emit('request', options);
  if (typeof options === 'string') {
    return http.get(options, cb);
  }
  http.request(options, cb);
};

function chronosUrl(topic, cursor) {
  var template = 'http://saturn.qa-ext.livefyre.com/api/v4/renderer/{topic}';
  var url = template.replace('{topic}', topic);
  if ( ! cursor) {
    return url;
  }
  var hasPrev = cursor.hasPrev;
  if ( ! hasPrev) {
    // there is no more
    return;
  }
  url += '?' + qs.stringify({ until: cursor.prev });
  return url;
}
