const express = require('express');

const app = express();

//first middleware
app.use((req, res, next) => {
  console.log('In the middleware');
  next(); // Allows the request to continuse to the next middleware in line
});

app.use((req, res, next) => {
  console.log('In another middleware');
  res.send('<h1>Hello</h1>')
});


app.listen(3000);