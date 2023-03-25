export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 27017,
    db: process.env.DATABASE_DB || 'payever',
  },
  rabbit: {
    host: process.env.RABBIT_HOST || 'localhost',
    port: parseInt(process.env.RABBIT_PORT) || 5672,
  },
});
