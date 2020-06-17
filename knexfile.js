require('dotenv').config();

module.exports = {
  development: {
    client: 'postgresql',
    // connection: process.env.DATABASE_URL
    connection: {
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
  },
  staging: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL
  },
  production: {
    connection: {
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
  },
}
