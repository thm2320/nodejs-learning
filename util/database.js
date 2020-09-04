const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-learning', 'root', 'mysqlpw', {
  dialect: 'mysql', 
  host: 'localhost'
});

module.exports = sequelize;