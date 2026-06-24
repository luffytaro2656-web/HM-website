import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  console.log('Connecting to MySQL host to ensure database exists...');
  
  // 1. First connection without database name (to ensure database exists)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });

  const dbName = process.env.DB_NAME || 'hms_db';
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  console.log(`Database "${dbName}" verified/created successfully.`);
  await connection.end();

  // 2. Re-connect directly to the created database
  console.log('Connecting to the database to build schema...');
  const dbConnection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: dbName,
    multipleStatements: true // Allow executing file in one go
  });

  // 3. Read and run schema.sql
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Running schema.sql scripts...');
  await dbConnection.query(schemaSql);
  console.log('Schema tables created successfully!');

  await dbConnection.end();
}

initializeDatabase()
  .then(() => {
    console.log('Database initialization completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error initializing database:', err);
    process.exit(1);
  });
