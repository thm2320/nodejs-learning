const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items: [{
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }]
  }
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    })
  }

  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();

}

userSchema.methods.removeFromCart = function(productId){
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
}

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const { getDb } = require('../util/database');

// const ObjectId = (id) => {
//   return new mongodb.ObjectId(id);
// }

// class User {
//   constructor(name, email, cart, id) {
//     this.name = name;
//     this.email = email;
//     this.cart = cart; // {items: []}
//     this._id = id;
//   }

//   save() {
//     const db = getDb();
//     return db.collection('users')
//       .insertOne(this)
//       .then(result => {
//         console.log(result)
//       })
//       .catch(err => {
//         console.log(err)
//       });
//   }


//   addOrder() {
//     const db = getDb();
//     return this.getCart()
//       .then(products => {
//         const order = {
//           items: products,
//           user: {
//             _id: ObjectId(this._id),
//             name: this.name
//           }
//         }
//         return db.collection('orders').insertOne(order)
//       })
//       .then(result => {
//         this.cart = { items: [] };
//         return db.collection('users')
//           .updateOne(
//             { _id: ObjectId(this._id) },
//             {
//               $set:
//                 { cart: { items: [] } }
//             }
//           )
//       });
//   }

//   getOrders() {
//     const db = getDb();
//     return db.collection('orders')
//       .find({ "user._id": ObjectId(this._id) })
//       .toArray();
//   }

//   static findById(userId) {
//     const db = getDb();
//     return db.collection('users')
//       .findOne({ _id: ObjectId(userId) })
//       .then(user => {
//         console.log(user);
//         return user;
//       })
//       .catch(err => console.log(err))
//   }
// }

// module.exports = User;