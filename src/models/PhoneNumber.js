const Sequelize = require('sequelize');
const sequelize = require('./../config/dbcon');

const PhoneNumber = sequelize.define('phone_number', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
  },
  number: {
    type: Sequelize.STRING,
  },
  account_id: {
    type: Sequelize.BIGINT,
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
  tableName: 'phone_number',
});

module.exports = PhoneNumber;
