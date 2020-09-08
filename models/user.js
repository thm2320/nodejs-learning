const mongodb = require('mongodb');
const { getDb } = require('../util/database');

const ObjectId = (id) => {
  return new mongodb.ObjectId(id);
}

class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  save() {
    const db = getDb();
    return db.collection('users')
      .insertOne(this)
      .then(result => {
        console.log(result)
      })
      .catch(err => {
        console.log(err)
      });
  }

  static findById(userId) {
    const db = getDb();
    return db.collection('users')
      .findOne({ _id: ObjectId(userId) })
      .then(user => {
        console.log(user);
        return user;
      })
      .catch(err => console.log(err))
  }
}

module.exports = User;