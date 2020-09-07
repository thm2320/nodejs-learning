const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = (callback) => {
  MongoClient
  .connect('mongodb+srv://admin:mymongopw@cluster0.ixc3f.mongodb.net/test?retryWrites=true&w=majority')
  .then(result => {
    console.log('Connected mongodb');
    callback(result);
  })
  .catch(err => {
    console.log(err);
  });
}

module.exports = mongoConnect;

