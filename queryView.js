const rp            = require('request-promise');
const couchbase     = require('couchbase')
const cluster       = new couchbase.Cluster('couchbase://localhost/');
const sTable        = 'incidents';
const bucket        = cluster.openBucket(sTable);
const SpatialQuery  = couchbase.SpatialQuery;


// https://developer.couchbase.com/documentation/server/4.1/views/sv-queries-bbox.html
// http bbox query, order lower left, upper right coordinate: bbox=0,0,180,90 or start_range=[0,0]&end_range[180,90]
// curl -X GET "http://localhost:8092/incidents/_design/dev_spatial/_spatial/spatial?bbox=-73.99915442655151,40.70326501520648,-73.99553553972424,40.76283264221314"

/*
const options = {
  method: 'get',
  uri: `http://localhost:8092/incidents/_design/dev_spatial/_spatial/spatial?bbox=-73.99915442655151,40.70326501520648,-73.99553553972424,40.76283264221314`,
  json: true
};

const t0 = Date.now();
rp(options).then( (result) => {
    // console.log({ results : results })
    // for(let i in results) {
    //   console.log(results[i]);
    // }
  console.log({ action: 'spatial query request', time: Date.now() - t0 + 'ms' });
  // { action: 'spatial query request', time: '74ms' }
})
.catch( (err) => {
  throw err;
});
*/

// http://docs.couchbase.com/sdk-api/couchbase-node-client-2.0.5/SpatialQuery.html#bbox
// SpatialQuery.bbox [left,top,right,bottom] or [w,s,e,n], [minimum longitude,maximum latitude,maximum longitude,minimum latitude]
// This value must be an array of exactly 4 numbers which represents the left, top, right and bottom edges of the bounding box (in that order).
// lies: the original query arg order of lower left, upper right functioned though

/*
const query = SpatialQuery.from('dev_spatial', 'spatial').bbox([-73.99915442655151,40.70326501520648,-73.99553553972424,40.76283264221314]);
const t1 = Date.now();
bucket.query(query, function(err, results) {
  if (err) throw err;
  else {
    // console.log({ results : results })
    // for(let i in results) {
    //   console.log(results[i]);
    // }
    console.log('SpatialQuery sdk',Date.now()-t1 + 'ms');    
    // SpatialQuery sdk 53ms
  }
});
*/

const nearestQuery = (options) => {
  return new Promise( (resolve,reject) => {
    const query = SpatialQuery.from('dev_spatial', 'spatial').bbox([options.lowerLongitude,options.lowerLatitude,options.upperLongitude,options.upperLatitude]);
    const t1 = Date.now();
    bucket.query(query, function(err, results) {
      if (err) {
        reject(err);
      }
      else {
        // console.log('SpatialQuery sdk',Date.now()-t1 + 'ms');
        let aOut = [];
        if (Array.isArray(results)) {
          aOut = results.sort( (a,b) => { return b.ts - a.ts });
        }
        resolve(aOut.slice(0,options.N));
      }
    });
  });
}


const center    = [-73.993549, 40.727248];
const lowerLeft = [-74.009180, 40.716425];
const deltaLon  = 2 * Math.abs(center[0] - lowerLeft[0]);
const deltaLat  = 2 * Math.abs(center[1] - lowerLeft[1]);

// spatial view query can't handle 1000 queries
// local system chokes all kinds of badness ensues
// chrome freezes, dropbox fails to respond, mass hysteria
const NQueries = 100; 
const N = 20;


let t0 = Date.now();

let aPromises = [];
for (let i=0;i < NQueries;i++) {
  const searchLon       = lowerLeft[0] + Math.random() * deltaLon;
  const searchLat       = lowerLeft[1] + Math.random() * deltaLat;
  const halfWinLon      = Math.random() * 0.04;
  const halfWinLat      = Math.random() * 0.04;

  // match all
  // const searchLon       = center[0];
  // const searchLat       = center[1];
  // const halfWinLon      = deltaLon/2;
  // const halfWinLat      = deltaLat/2;

  const lowerLatitude   = searchLat - halfWinLat;
  const lowerLongitude  = searchLon - halfWinLon;
  const upperLatitude   = searchLat + halfWinLat;
  const upperLongitude  = searchLon + halfWinLon;

  let aQuery = nearestQuery({ lowerLatitude: lowerLatitude, upperLatitude: upperLatitude, lowerLongitude: lowerLongitude, upperLongitude: upperLongitude, N:N });
  aPromises.push(aQuery);
}


Promise.all(aPromises).then( aResults => {
  let t1 = Date.now();
  console.log({ queriesTimeMS: t1-t0, queriesPerSecond: NQueries / ( (t1-t0)/1000 ) })
  // console.log({ action: 'query.success', aResults: aResults });
  // for (let i in aResults) {
  //   const result = aResults[i];
  //   console.log({ action: 'query', aKeys: aKeys });
  //   // const aKeys = result.map( (oMatch) => oMatch.id )
  //   // console.log({ action: 'query', aKeys: aKeys });
  // }
})
.catch( err => {
  console.log({ action: 'query.err', err:err });
  process.exit(1);
})       


