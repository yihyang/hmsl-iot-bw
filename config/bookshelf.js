const knexConfig = require('./../knexfile').development;
const Knex = require('knex');
const Bookshelf = require('bookshelf');

let bookshelf = Bookshelf(
  Knex(knexConfig)
);

module.exports = bookshelf;
