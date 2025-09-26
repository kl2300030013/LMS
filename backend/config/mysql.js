import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const {
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
} = process.env;

let pool = null;

if (MYSQL_HOST && MYSQL_USER && MYSQL_DATABASE) {
  try {
    pool = mysql.createPool({
      host: MYSQL_HOST,
      port: Number(MYSQL_PORT || 3306),
      user: MYSQL_USER,
      password: root,
      database: eduflow,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log('✅ MySQL pool initialized');
  } catch (error) {
    console.warn('⚠️ Failed to initialize MySQL pool:', error.message);
  }
} else {
  console.warn('⚠️ MySQL env not set. Skipping MySQL initialization.');
}

export { pool };



