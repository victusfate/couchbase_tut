const couchbase = require('couchbase')
const cluster = new couchbase.Cluster('couchbase://localhost/');
const bucket = cluster.openBucket('default');
const N1qlQuery = couchbase.N1qlQuery;

bucket.manager().createPrimaryIndex(function() {
  bucket.upsert('user:king_arthur', {
    'email': 'kingarthur@couchbase.com', 'interests': ['Holy Grail', 'African Swallows']
  },
  function (err, result) {
    bucket.get('user:king_arthur', function (err, result) {
      console.log('Got result: %j', result.value);
      bucket.query(
        N1qlQuery.fromString('SELECT * FROM default WHERE $1 in interests LIMIT 1').consistency(N1qlQuery.Consistency.REQUEST_PLUS),
        ['African Swallows'],
        function (err, rows) {
          console.log("N1qlQuery 1 rows: %j", rows);
        }
      );
      setTimeout( () => {
        bucket.query(
          N1qlQuery.fromString('SELECT * FROM default WHERE $1 in interests LIMIT 1'),
          ['African Swallows'],
          function (err, rows) {
            console.log("N1qlQuery 2 (1s delayed) rows: %j", rows);
          }
        );
      },1000)
    });
  });
});