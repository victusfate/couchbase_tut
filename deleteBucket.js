const rp        = require('request-promise');
const sTable    = 'incidents';
// dbCredentials.txt looks like user:Password (without any trailing line return)
const userPass  = require('fs').readFileSync('dbCredentials.txt').toString();

// curl -X DELETE -u Administrator:sesame -d 'name=incidents' http://localhost:8091/pools/default/buckets

const options = {
  method: 'delete',
  uri: `http://${userPass}@localhost:8091/pools/default/buckets/${sTable}`,
  json: true
};

rp(options).then( (result) => {
  console.log({ action: 'bucketDelete', result: JSON.stringify(result, null, 2) });
  process.exit(0);
})
.catch( (err) => {
  throw err;
});
