var Parse = require('parse/node');

const MongoClient = require('mongodb').MongoClient;
// Connection url
const url = 'mongodb://admin:admin123@ds247670.mlab.com:47670/proglass';
// Database Name
const dbName = 'proglass';
// Connect using MongoClient
MongoClient.connect(url, function(err, client) {
  // Use the admin database for the operation
  const adminDb = client.db(dbName).admin();
  // List all the available databases
  adminDb.listDatabases(function(err, dbs) {
    test.equal(null, err);
    test.ok(dbs.databases.length > 0);
    client.close();
  });
});

Parse.initialize("myAppId");
Parse.serverURL = 'http://localhost:1337/parse';


var query = new Parse.Query("File");
query.find().then(console.log)
