const path = require('path');

const express = require('express');

const router = express.Router();


/*
"get" will match the exact route, 
"use" will match the url start with '/'
*/
router.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'shop.html'));
});


module.exports = router;