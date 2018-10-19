const { Client } = require('pg');

// instantiate client using your DB configurations
// const client = new Client({
//   database: 'd46tsp14hkrlur',
//   user: 'prifmxipdwnwbx',
//   password: '35b9bc58401ab3bfadcf724a9c0e770ce9d729a7ee2be896bee49338efe3b7be',
//   host: 'ec2-50-16-196-238.compute-1.amazonaws.com',
//   port: 5432,
//   ssl: true
// });

const client = new Client({
  database: 'd25krtj6fcj9qm',
  user: 'goqgyehevalloc',
  password: '32fac540a8a6e8f3c046fb03e49b914edb874bbf6b5b1327779ec95a4a806495',
  host: 'ec2-23-23-216-40.compute-1.amazonaws.com',
  port: 5432,
  ssl: true
});

client.connect().then(function () {
  console.log('connected to database from module!')
}).catch(function (err) {
  if (err) {}
  console.log('cannot connect to database!')
})


module.exports = {
  query: (text, callback) => {
    return client.query(text, callback)
  }
}


