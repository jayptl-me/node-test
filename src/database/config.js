const { Pool } = require('pg');
require('dotenv').config();


// Production-ready connection pool configuration
const poolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: parseInt(process.env.DB_POOL_MAX) || 20, // Maximum number of clients in the pool
    min: parseInt(process.env.DB_POOL_MIN) || 5,  // Minimum number of clients in the pool
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 5000, // Return error after 5 seconds if connection could not be established
    maxUses: parseInt(process.env.DB_MAX_USES) || 7500, // Close (and replace) a connection after it has been used 7500 times
    allowExitOnIdle: process.env.NODE_ENV !== 'production', // Allow pool to exit on idle in non-production
    statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT) || 30000, // 30 second statement timeout
    query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 30000, // 30 second query timeout
    application_name: 'event-management-api'
};

// Always use SSL if DB_SSL is set (Render requires SSL for all connections)
if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') {
    poolConfig.ssl = {
        rejectUnauthorized: false // Accept self-signed certs (Render default)
    };
}

const pool = new Pool(poolConfig);

// Enhanced connection event handlers
pool.on('connect', (client) => {
    console.log(`Connected to PostgreSQL database - PID: ${client.processID}`);
});

pool.on('acquire', (client) => {
    console.log(`Client acquired from pool - PID: ${client.processID}`);
});

pool.on('release', (err, client) => {
    if (err) {
        console.error('Error releasing client:', err);
    } else {
        console.log(`Client released back to pool - PID: ${client.processID}`);
    }
});

pool.on('remove', (client) => {
    console.log(`Client removed from pool - PID: ${client.processID}`);
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    console.error('Client info:', client ? `PID: ${client.processID}` : 'No client info');

    // Don't exit in production, just log the error
    if (process.env.NODE_ENV !== 'production') {
        process.exit(-1);
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Received SIGINT, closing database pool...');
    pool.end(() => {
        console.log('Database pool has ended');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM, closing database pool...');
    pool.end(() => {
        console.log('Database pool has ended');
        process.exit(0);
    });
});

module.exports = pool;
