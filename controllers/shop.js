const fs = require('fs');
const path = require('path');

const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      console.log(products)
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatisCode = 500
      return next(error)
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        pageTitle: product.title,
        path: '/products',
        product: product
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatisCode = 500
      return next(error)
    });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatisCode = 500
      return next(error)
    });
};

exports.getCart = (req, res, next) => {

  req.user
    .populate('cart.items.productId')
    .execPopulate() // for populate from a document, it is to return a promise, not required for .find
    .then(user => {
      const products = user.cart.items
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatisCode = 500
      return next(error)
    });

};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      console.log(req.user)
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatisCode = 500
      return next(error)
    });

};


exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate() // for populate from a document, it is to return a promise, not required for .find
    .then(user => {
      console.log(user.cart.items)
      const products = user.cart.items.map(i => {
        return {
          quantity: i.quantity,
          product: { ...i.productId._doc } // .doc get all the details in the product
        }
      })

      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });

      return order.save()
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {

      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatisCode = 500
      return next(error)
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      })
    });
};


exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'))
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'))
      }
      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join('data', 'invoices', invoiceName);
      fs.readFile(invoicePath, (err, data) => {
        console.log(invoicePath)
        if (err) {
          return next(err);
        }
        res.setHeader('Content-Type', 'application/pdf'); //the data content type
        res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`); //how to serve the client
        res.send(data)
      });
    })
    .catch(err => next(err))


}