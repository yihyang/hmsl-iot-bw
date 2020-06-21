const env = process.env.NODE_ENV || 'development';
const knexConfig = require('./../knexfile')[env];
const Knex = require('knex');
const Bookshelf = require('bookshelf');

let bookshelf = Bookshelf(
  Knex(knexConfig)
);

module.exports = bookshelf;
