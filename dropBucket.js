// use local gui at 127.0.0.1:8091 for now

/*
const r = require('rethinkdb');

r.connect( {host: 'localhost', port: 28015, db: 'test'}, (err, conn) => {
  if (err) throw err;

  const sTable = 'incidents';

  r.tableDrop(sTable).run(conn).then( (result) => {
    console.log({ action: 'tableDrop', result: JSON.stringify(result, null, 2) });
    process.exit(0);
  })
  .catch( (err) => {
    throw err;
  });

});

*/