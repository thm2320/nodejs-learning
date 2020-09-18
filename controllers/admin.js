const mongodb = require('mongodb');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, description, price } = req.body
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      // console.log(result)
      console.log("Created Product");
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err)
    });

};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const {
    productId, title, imageUrl, description, price
  } = req.body;

  Product.findById(productId)
    .then(product => {
      Object.assign(product, { title, imageUrl, description, price });
      return product.save()

    })
    .then(result => {
      console.log('Updated Product');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));


};

exports.getProducts = (req, res, next) => {
  Product.find()
    //.select('title price -_id') // include/exclude the fields in the selection
    //.populate('userId') // populate the document details of the field instead of only id
    .then((products) => {
      console.log(products)
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    }).catch(err => {
      console.log(err)
    })
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndRemove(prodId)
    .then(() => {
      console.log('destroy product')
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err)
    });
}