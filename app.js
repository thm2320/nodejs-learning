const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.get('/favicon.ico', (req, res) => res.status(204));

app.use(bodyParser.urlencoded({extended:false}));

app.use('/add-product', (req, res, next) => {
  res.send('<form action="/product" method="POST"><input type="text" name="title"><button type="submit">Add Product</button></form>')
});

app.post('/product', (req, res) => {
  console.log(req.body);
  res.redirect('/');
})

app.use('/', (req, res, next) => {
  res.send('<h1>Hello</h1>')
});




app.listen(3000);