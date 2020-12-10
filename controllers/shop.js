const fs = require('fs');
const path = require('path');
const stripe = require('stripe')('sk_test_51HwNr7D7m7tbQQExCYaCUd8vegxl6my8zoUHAQCkazAfDOH09c8WEfD4EWSePvBSScifjRI7mSzW9i5Av4mCa9Yu00A8ynzn2h');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 1;

exports.getProducts = (req, res, next) => {

  const page = +req.query.page || 1;
  let totalProducts;

  Product.find()
    .countDocuments()
    .then(num => {
      totalProducts = num;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {

      const pageInfo = {
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE)
      }

      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        pageInfo

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
  const page = +req.query.page || 1;
  let totalProducts;

  Product.find()
    .countDocuments()
    .then(num => {
      totalProducts = num;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {

      const pageInfo = {
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE)
      }
      console.log(pageInfo)

      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        totalProducts,
        pageInfo
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

exports.getCheckout = (req, res, next) => {
  let products;
  let totalSum;
  req.user
    .populate('cart.items.productId')
    .execPopulate() // for populate from a document, it is to return a promise, not required for .find
    .then(user => {
      products = user.cart.items
      totalSum = products.reduce((sum, p) => {
        sum += p.quantity * p.productId.price
        return sum
      }, 0)

      const prodList = products.map(p => {
        return {
          name: p.productId.title,
          description: p.productId.description,
          amount: p.productId.price * 1000,
          currency: 'usd',
          quantity: p.quantity
        };
      })
      console.log(prodList)

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: prodList,
        success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`,
      });
    })
    .then((session) => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum,
        sessionId: session.id
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatisCode = 500
      return next(error)
    });

}

exports.getCheckoutSuccess = (req, res, next) => {
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

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf'); //the data content type
      res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`); //how to serve the client
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true,
      })
      pdfDoc.text('---------------------')
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price
        pdfDoc.fontSize(14).text(`${prod.product.title} - ${prod.quantity} x $${prod.product.price}`)
      })
      pdfDoc.text('---------------------')
      pdfDoc.text(`Total Price: $${totalPrice}`)

      pdfDoc.end();
      // loading whole file data into system memory, not good at downloading
      /* fs.readFile(invoicePath, (err, data) => {
        console.log(invoicePath)
        if (err) {
          return next(err);
        }
        res.setHeader('Content-Type', 'application/pdf'); //the data content type
        res.setHeader('Content-Disposition', `inline; filename = "${invoiceName}"`); //how to serve the client
        res.send(data)
      }); */

      // streaming file data
      /* const file = fs.createReadStream(invoicePath);
      res.setHeader('Content-Type', 'application/pdf'); //the data content type
      res.setHeader('Content-Disposition', `inline; filename = "${invoiceName}"`); //how to serve the client
      file.pipe(res); */

    })
    .catch(err => next(err))


}