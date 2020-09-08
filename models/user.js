const mongodb = require('mongodb');
const { getDb } = require('../util/database');

const ObjectId = (id) => {
  return new mongodb.ObjectId(id);
}

class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = id;
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

  addToCart(product) {
    // const cartProduct = this.cart.items.findIndex(cp => {
    //   return cp._id === product._id;
    // });
    const updatedCart = { items: [{ productId: ObjectId(product._id), quantity: 1 }] };
    const db = getDb();
    return db.collection('users')
      .updateOne(
        { _id: ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      )
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