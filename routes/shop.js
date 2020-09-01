const express = require('express');

const router = express.Router();


/*
"get" will match the exact route, 
"use" will match the url start with '/'
*/
router.get('/', (req, res, next) => {
  res.send('<h1>Hello</h1>')
});


module.exports = router;