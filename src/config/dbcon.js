// Import the ORM library
const Sequelize = require('sequelize');

// Fetching connection details from .env file
const database = process.env.DB_NAME || 'smsdb';
const username = process.env.DB_USERNAME;
const password = process.env.DB_USERPASS;
const host = process.env.DB_HOST || '127.0.0.1';
const port = process.env.DB_PORT || 5432;

const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect: 'postgres',
  operatorsAliases: false,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
