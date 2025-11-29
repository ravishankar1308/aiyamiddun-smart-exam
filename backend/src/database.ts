import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aiyamiddun_digital',
};

export let connection: mysql.Connection;

export async function connectToDatabase() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL Database!');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1); // Exit if the database connection fails
  }
}
