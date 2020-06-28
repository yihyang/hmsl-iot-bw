const rootPath = './../../..';
const bookshelf = require(`${rootPath}/config/bookshelf`);
const GwoSparePartStock = require('./GwoSparePartStock');
const User = require(`${rootPath}/app/models/Account/User`);

// General Work Order
var GwoSparePart = bookshelf.Model.extend({
  hasTimestamps: true,
  tableName: 'gwo_spare_parts',
  stocks() {
    return this.hasMany(GwoSparePartStock)
  },
  user() {
    return this.belongsTo(User)
  }
}, {
  async updateCurrentQuantity(sparePartId) {
    let query = `
    UPDATE gwo_spare_parts
    SET current_quantity = reference.current_quantity
    FROM
    (
      SELECT gwo_spare_part_id AS id, SUM(quantity) AS current_quantity
      FROM gwo_spare_part_stocks
      WHERE gwo_spare_part_id = ?
      GROUP BY gwo_spare_part_id
    ) AS reference
    WHERE gwo_spare_parts.id = reference.id
    `;

    await bookshelf.knex.raw(query, sparePartId);
  }
});

module.exports = GwoSparePart;
