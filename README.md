# chronos-stream

Stream activity objects about a topic from Livefyre's Chronos Service.

Behind the scenes, this will lazily request pages of data over HTTP.

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
