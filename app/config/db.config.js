module.exports = {
  HOST: "database-dandi.c2kfdi3bqt2u.ap-southeast-2.rds.amazonaws.com",
  USER: "dandi",
  PASSWORD: "dandi123",
  DB: "dandi_db",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
