
const mysql = require('mysql2');
// Create a connection pool for handling database connections
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'pass1',
  database: 'santral_lfdb',
  waitForConnections: true
});

pool.getConnection((err, connection) => {
  if (err) {

    console.error('Database connection failed:', err);
    process.exit(1);
  } else {
  
    console.log('Connected to the database!');
    connection.release();
  }
});
// Export the created pool to be used by other parts of the application
module.exports = pool;