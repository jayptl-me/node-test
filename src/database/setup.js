const pool = require('./config');

const createTables = async () => {
    const client = await pool.connect();

    try {
        // Create users table
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create events table
        await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date_time TIMESTAMP NOT NULL,
        location VARCHAR(255) NOT NULL,
        capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create event_registrations table (many-to-many relationship)
        await client.query(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, event_id)
      )
    `);

        // Create indexes for better performance
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_date_time ON events(date_time);
    `);

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_location ON events(location);
    `);

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON event_registrations(event_id);
    `);

        console.log('Database tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    } finally {
        client.release();
    }
};

const setupDatabase = async () => {
    try {
        await createTables();
        console.log('Database setup completed');
    } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    }
};

// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase().then(() => {
        process.exit(0);
    });
}

module.exports = { createTables, setupDatabase };
