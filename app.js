const express = require('express');

const app = express();

app.get('/favicon.ico', (req, res) => res.status(204));

app.use('/', (req, res, next) => {
  console.log('always runs!');
  console.log(req.url)
  next();
});

app.use('/add-product', (req, res, next) => {
  console.log('In Add Product');
  res.send('<h1>Add product</h1>')
});

app.use('/', (req, res, next) => {
  console.log('In another middleware');
  res.send('<h1>Hello</h1>')
});




app.listen(3000);