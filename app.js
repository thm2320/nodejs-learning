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
  User.findById("5f5839ded767a01ea867574d")
    .then(user => {
      req.user = user;
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
    User.findOne().then(user => {
      if (!user){
        const user = new User({
          name: 'Admin',
          email: 'admin@admin.com',
          cart: {
            items: []
          }
        })
        user.save()
      }
    })
    app.listen(3000);
  })
  .catch(err => console.log(err));

