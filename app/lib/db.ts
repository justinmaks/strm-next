import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  console.log('Creating data directory...');
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize the database
const dbPath = path.join(dataDir, 'users.db');
console.log('Database path:', dbPath);

let db: Database.Database;

try {
  console.log('Initializing database...');
  db = new Database(dbPath, {
    readonly: false,
    fileMustExist: false,
    timeout: 5000,
    verbose: console.log
  });

  // Set pragmas for better security
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');

  // Create tables if they don't exist
  console.log('Creating tables if they don\'t exist...');
  const createTables = () => {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        last_ip TEXT
      )
    `;

    db.exec(createUsersTable);
  };

  // Initialize tables
  createTables();
  console.log('Database initialization complete');

} catch (error) {
  console.error('Database initialization error:', error);
  throw error;
}

export default db; 