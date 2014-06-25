# chronos-stream

Stream activity objects about a topic from Livefyre's Chronos Service. Behind the scenes, this will lazily request pages of data over HTTP.

This module is intended to work in both node.js and the browser (via browserify). Run `make dist` to put the browser bundle in dist/.

```javascript
var activities = require('chronos-stream')('urn:livefyre:livefyre.com:site=290596:collection=2486485:SiteStream');

activities.on('error', function (e) {
    console.error("Error streaming activities", e);
});

activities.on('data', function (activity) {
    console.log('activity', activity);    
});

activities.on('end', function () {
    console.log('done streaming activities from chronos');    
});
```

## Example CLI

[example.js](./example.js) is an example CLI. It parses the following options

* `--auth` - an lftoken to request Chronos with

## `make` commands

* `make build` - will `npm install` and `bower install`
* `make dist` - will use r.js optimizer to compile the source, UMD wrap, and place that and source maps in dist/
* `make clean`
* `make server` - serve the repo over http
* `make deploy [env={*prod,uat,qa}]` - Deploy to lfcdn, optionally specifying a bucket env
