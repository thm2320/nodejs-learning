const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.get('/favicon.ico', (req, res) => res.status(204));

app.use(bodyParser.urlencoded({extended:false}));

//the order here will affecting the route behavior if the routes are using "router.use" method
app.use('/admin',adminRoutes); // filter the route, all url start with '/admin' with go this router
app.use(shopRoutes);

app.use((req, res, next) => {
  //method cascading
  res.status(404).send('<h1>Page not found</h1>')
});

app.listen(3000);