const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

const errorController = require('./controllers/error');
const User = require('./models/user');

//ejs template engine
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.get('/favicon.ico', (req, res) => res.status(204));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById("5f56f72d78f267e71304ee6d")
    .then(user => {
      const { name, email, cart, _id } = user;
      req.user = new User(name, email, cart, _id);
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect('mongodb+srv://admin:mymongopw@cluster0.ixc3f.mongodb.net/shop?retryWrites=true&w=majority')
  .then(result => {
    app.listen(3000);
  })
  .catch(err => console.log(err));

