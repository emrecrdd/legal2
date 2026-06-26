import { Sequelize } from 'sequelize';
import { config } from './env.js';
import { logger } from './logger.js';
import { initModels } from '../models/index.js';

// ❗ DATABASE_URL kontrol (EN ÖNEMLİ KISIM)
if (!config.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL missing in environment variables");
}

// Sequelize instance
export const sequelize = new Sequelize(config.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },

  logging: config.NODE_ENV === 'development'
    ? (msg) => logger.debug(msg)
    : false,

  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
  },
});

// DB connect function
export const connectDB = async () => {
  try {
    await sequelize.authenticate();

    logger.info('✅ Neon PostgreSQL connected');

    initModels(sequelize);

    if (config.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('✅ Database synced');
    }

    return sequelize;

  } catch (error) {
    // ❗ ARTIK HATA GİZLENMİYOR (DEBUG İÇİN)
    logger.error('❌ DB connection failed:', error);

    // serverı tamamen öldürme ama hatayı saklama
    throw error;
  }
};
