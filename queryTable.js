/*
const r = require('rethinkdb');

r.connect( {host: 'localhost', port: 28015, db: 'test' }).then( (conn) => {
  const sTable = 'incidents';


  const center    = [-73.993549, 40.727248];
  const lowerLeft = [-74.009180, 40.716425];
  const deltaLon  = 2 * Math.abs(lowerLeft[0] - (-73.97725));
  const deltaLat  = 2 * Math.abs(lowerLeft[1] - (40.7518692));

  const NQueries = 1000;
  const N = 20;


  let t0 = Date.now();

  let aPromises = [];
  for (let i=0;i < NQueries;i++) {
    const searchLon       = lowerLeft[0] + Math.random() * deltaLon;
    const searchLat       = lowerLeft[1] + Math.random() * deltaLat;
    const halfWinLon      = Math.random() * 0.04;
    const halfWinLat      = Math.random() * 0.04;

    const lowerLatitude   = searchLat - halfWinLat;
    const lowerLongitude  = searchLon - halfWinLon;
    const upperLatitude   = searchLat + halfWinLat;
    const upperLongitude  = searchLon + halfWinLon;


    let aQuery = r.table(sTable)
    .orderBy({ index: r.desc('ts')})
    // .filter(function (oIncident) {
    //   return oIncident('latitude').gt(lowerLatitude)
    //     .and(oIncident('latitude').lt(upperLatitude))
    //     .and(oIncident('longitude').gt(lowerLongitude))
    //     .and(oIncident('longitude').lt(upperLongitude))
    // })
    .filter(function (oIncident) {
      return oIncident('latitude').gt(lowerLatitude);
    })
    .filter(function (oIncident) {
      return oIncident('latitude').lt(upperLatitude);
    })
    .filter(function (oIncident) {
      return oIncident('longitude').gt(lowerLongitude);
    })
    .filter(function (oIncident) {
      return oIncident('longitude').lt(upperLongitude);
    })
    // .orderBy({ index: r.desc('ts')})
    .limit(N)
    .run(conn)
    .then( (cursor) => {
      // console.log({ action: 'query', aKeys: aKeys, ll: [lowerLatitude,upperLatitude,lowerLongitude,upperLongitude] });
      return cursor.toArray()
    })

    aPromises.push(aQuery);
  }
  

  Promise.all(aPromises).then( (aResults) => {
    let t1 = Date.now();
    console.log({ queriesTimeMS: t1-t0, queriesPerSecond: NQueries / ( (t1-t0)/1000 ) })
    for (let i in aResults) {
      const result = aResults[i];
      const aKeys = result.map( (oMatch) => oMatch.id )
      // console.log({ action: 'query', aKeys: aKeys });
    }
    return conn.close();
  })
  .catch( (err) => {
    throw err;
  })       

})
.catch( (err) => {
  throw err;
})
*/
