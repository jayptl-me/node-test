// Clean DB utility for tests: truncates all tables and resets sequences
const pool = require('./config');

async function cleanDatabase() {
    const client = await pool.connect();
    try {
        // Disable referential integrity temporarily
        await client.query('BEGIN');
        await client.query('TRUNCATE TABLE event_registrations RESTART IDENTITY CASCADE');
        await client.query('TRUNCATE TABLE events RESTART IDENTITY CASCADE');
        await client.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
        await client.query('COMMIT');
        console.log('✅ Database cleaned (all tables truncated, sequences reset)');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Failed to clean database:', err);
        throw err;
    } finally {
        client.release();
    }
}

if (require.main === module) {
    cleanDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { cleanDatabase };
