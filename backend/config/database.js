const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'calendar',
  process.env.DB_USER || 'admin',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 60000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`MySQL Connected: ${process.env.DB_HOST}`);
    
    // Sync database tables
    await sequelize.sync({ alter: true });
    console.log('Database tables synced');
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    console.error('Please check:');
    console.error('1. AWS RDS Security Group allows your IP on port 3306');
    console.error('2. Database credentials are correct');
    console.error('3. RDS instance is publicly accessible');
    console.error('\nServer will continue running but database operations will fail.');
    // Don't exit - let server run for debugging
  }
};

module.exports = { sequelize, connectDB };
