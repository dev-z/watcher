const Sequelize = require('sequelize');
const sequelize = require('./../config/dbcon');

const Account = sequelize.define('account', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
  },
  auth_id: {
    type: Sequelize.STRING,
  },
  username: {
    type: Sequelize.STRING,
  },
}, {
  // don't add the timestamp attributes (updatedAt, createdAt)
  timestamps: false,

  // don't use camelcase for automatically added attributes but underscore style
  // so updatedAt will be updated_at
  underscored: true,

  // disable the modification of tablenames; By default, sequelize will automatically
  // transform all passed model names (first parameter of define) into plural.
  // if you don't want that, set the following
  freezeTableName: true,

  // define the table's name
  tableName: 'account',
});

module.exports = Account;
