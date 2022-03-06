require('dotenv').config();

module.exports = {
  development: {
    client: 'postgresql',
    // connection: process.env.DATABASE_URL
    connection: {
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
    },
  },
  staging: {
    client: 'postgresql',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl : {
        rejectUnauthorized: !process.env.DB_SSL_MODE
      }
    }

  },
  production: {
    client: 'postgresql',
    connection: {
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
    },
  },
}
