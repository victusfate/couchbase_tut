const couchbase = require('couchbase')
const cluster   = new couchbase.Cluster('couchbase://localhost/');
const sTable    = 'incidents';
const bucket    = cluster.openBucket(sTable);
const N1qlQuery = couchbase.N1qlQuery;

const Promise   = require("bluebird");

const aIndexes = [
  `create primary index id_idx on ${sTable} using GSI;`, // alternative to bucket.manager().createPrimaryIndex(function() {...});
  `create index ts_idx on ${sTable} (ts) using GSI;`,
  `create index latitude_idx on ${sTable} (latitude) using GSI;`,
  `create index longitude_idx on ${sTable} (longitude) using GSI;`
];

const t0 = Date.now();

const queryPromise = (sQuery) => {
  const sAction = 'queryPromise';
  return new Promise( (resolve,reject) => {
    const query = N1qlQuery.fromString(sQuery);
    bucket.query(query, (err,result) => {
      console.log({ action: sAction, time: Date.now()-t0 });
      if (err) {
        console.log({ action: sAction + '.err', sQuery: sQuery, err:err });
        // reject(err);
        resolve(); // just keep going
      }
      else {
        // Print Results
        console.log({ action: sAction, sQuery: sQuery, result:result });
        resolve(result)      
      }
    });    
  });
}

// run promises 1 at a time to avoid a conflict at GSI create index, see below

const aPromise = Promise.resolve(aIndexes).map(queryPromise,{ concurrency: 1 });

// when running all index creates simultaneously
// Error: GSI CreateIndex() - cause: Build Already In Progress. Bucket incidents
// let aPromises = [];
// for (let sQuery of aIndexes) {
//   console.log('sQuery',sQuery);
//   aPromises.push(queryPromise(sQuery));
// }
// Promise.all(aPromises)

aPromise.then( (aResults) => {
  console.log({ action: 'createIndexes.Successful', aResults: aResults });
  process.exit(0);
})
.catch( (err) => {
  console.log({ action: 'createIndexes.Failed', err:err });
  process.exit(1);
})

