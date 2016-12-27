const rp        = require('request-promise');
const sTable    = 'incidents';
// dbCredentials.txt looks like user:Password (without any trailing line return)
const userPass  = require('fs').readFileSync('dbCredentials.txt').toString();

// curl -X POST -u Administrator:sesame -d 'name=incidents' -d 'ramQuotaMB=6000' -d 'authType=none' -d 'replicaNumber=1' http://localhost:8091/pools/default/buckets

const options = {
  method: 'post',
  uri: `http://${userPass}@localhost:8091/pools/default/buckets`,
  form: {
    name        : sTable,
    ramQuotaMB  : 6000,
    authType    : 'none',
    proxyPort   : 11216
  },
  json: true
};

rp(options).then( (result) => {
  console.log({ action: 'bucketCreate', result: JSON.stringify(result, null, 2) });
  process.exit(0);
})
.catch( (err) => {
  throw err;
});
