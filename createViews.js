const couchbase = require('couchbase');

// ended up using n1ql indexes since it was straight forward
// not 100% sure how to generate design views, maybe like this: 
// https://github.com/couchbaselabs/beersample-node/blob/master/beer_designs.js

// map:    https://github.com/couchbaselabs/beersample-node/blob/master/beer_designs.js#L11,#L17
// update: https://github.com/couchbaselabs/beersample-node/blob/master/beer_designs.js#L26,#L44

// added it to the couchbase ui directly

// spatial view

// function (doc) {
//   if (doc.latitude && doc.longitude) {
//     emit([{
//      "type": "Point",
//      "coordinates":[doc.longitude, doc.latitude]
//     }], { doc: doc });
//   }
// }