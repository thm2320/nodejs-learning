// const Mongoose = require('mongoose')

const { validationResult } = require('express-validator/check');

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, description, price } = req.body;
  const image = req.file;
  console.log(image)
  const errors = validationResult(req);

  console.log(errors)
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title,
        imageUrl,
        price,
        description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const product = new Product({
    // _id: Mongoose.Types.ObjectId('5f687857378c743560283c44'),
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product
    .save()
    .then((result) => {
      // console.log(result)
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch(err => {
      // return res.status(500).render("admin/edit-product", {
      //   pageTitle: "Add Product",
      //   path: "/admin/add-product",
      //   editing: false,
      //   hasError: true,
      //   product: {
      //     title,
      //     imageUrl,
      //     price,
      //     description
      //   },
      //   errorMessage: 'Data operation failed, please try again',
      //   validationErrors: []
      // });
      // res.redirect('/500')
      const error = new Error(err);
      error.httpStatisCode = 500
      return next(error)
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  // throw new Error('dummy')
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatisCode = 500
      return next(error)
    });
};

exports.postEditProduct = (req, res, next) => {
  const {
    productId, title, imageUrl, description, price
  } = req.body;

  const errors = validationResult(req);

  console.log(errors)
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title,
        imageUrl,
        price,
        description,
        _id: productId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Product.findById(productId)
    .then(product => {
      console.log("postEditProduct")
      console.log(product.userId.toString())
      console.log(req.user._id)
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      Object.assign(product, { title, imageUrl, description, price });
      return product.save()
        .then(result => {
          console.log('Updated Product');
          res.redirect('/admin/products');
        })

    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatisCode = 500
      return next(error)
    });


};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    //.select('title price -_id') // include/exclude the fields in the selection
    //.populate('userId') // populate the document details of the field instead of only id
    .then((products) => {
      console.log(products)
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatisCode = 500
      return next(error)
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then(() => {
      console.log('destroy product')
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatisCode = 500
      return next(error)
    });
}