
const couchbase = require('couchbase')
const cluster   = new couchbase.Cluster('couchbase://localhost/');
const sTable    = 'incidents';
const bucket    = cluster.openBucket(sTable);
const N1qlQuery = couchbase.N1qlQuery;

const nearestQuery = (options) => {
  const sAction = 'nearestQuery';

  const aCommand = [ 
    `select ts,longitude,latitude,id from ${sTable}`,      
    `where (longitude between ${options.lowerLongitude} and ${options.upperLongitude})` +
     ` and (latitude  between ${options.lowerLatitude}  and ${options.upperLatitude})`,
    'order by ts desc',
    `limit ${options.N}`
  ];

  // sloowwwww!, several seconds at minimum
  // const aCommand = [ 
  //   `select * from ${sTable}`,      
  //   `where (latitude  between ${options.lowerLatitude}  and ${options.upperLatitude})` +
  //    ` and (longitude between ${options.lowerLongitude} and ${options.upperLongitude})`,
  //   'order by ts desc',
  //   `limit ${options.N}`
  // ];

  // const aCommand = [ 
  //   `select * from ${sTable} limit 1`
  // ];

  return new Promise( (resolve,reject) => {
    // console.log({ action: sAction, query: aCommand.join(' ') });
    // const query = N1qlQuery.fromString(aCommand.join(' '));
    const query = N1qlQuery.fromString(aCommand.join(' ')).adhoc(false);  // assists caching
    bucket.query(query, (err,result) => {
      if (err) {
        console.log({ action: sAction + '.err', options:options, err:err });
        reject(err)
      }
      else {
        let aOut = [];
        if (Array.isArray(result) && result.length >= 1) {
          // aOut = result[0][sTable];
          aOut = result
        }
        // Print Results        
        // console.log({ action: sAction, options:options, result:aOut });
        resolve(aOut)      
      }
    });    
  });
}

const center    = [-73.993549, 40.727248];
const lowerLeft = [-74.009180, 40.716425];
const deltaLon  = 2 * Math.abs(center[0] - lowerLeft[0]);
const deltaLat  = 2 * Math.abs(center[1] - lowerLeft[1]);

const NQueries = 100; // even fast covered index query can't handle 100 queries per second, local system chokes
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
