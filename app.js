const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');

const app = express();

//pug template engine
// app.set('view engine', 'pug'); // tell express to use 'pug' as 'view engine'
// app.set('views', 'views'); // set the directory of the views as 'view'

//handlebars (hbs) template engine
app.engine('hbs', expressHbs({
    layoutsDir: 'views/layouts/', 
    defaultLayout: 'main-layout',
    extname: 'hbs'
}));
app.set('view engine', 'hbs');
app.set('views', 'views');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.get('/favicon.ico', (req, res) => res.status(204));

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
    //res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));

    res.status(404).render('404',{
        pageTitle: 'Page not Found'
    });
});

app.listen(3000);
