const pool = require('../database/config');

class Event {
    static async getAllUserEvents(userId) {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT e.*
                FROM events e
                INNER JOIN event_registrations er ON e.id = er.event_id
                WHERE er.user_id = $1
                  AND e.date_time >= NOW() - INTERVAL '1 month'
                  AND e.date_time <= NOW()
                ORDER BY e.date_time ASC
            `, [userId]);
            return result.rows;
        } finally {
            client.release();
        }
    }
    static async create(title, dateTime, location, capacity) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'INSERT INTO events (title, date_time, location, capacity) VALUES ($1, $2, $3, $4) RETURNING *',
                [title, dateTime, location, capacity]
            );
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    static async findById(id) {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM events WHERE id = $1', [id]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    static async findByIdWithRegistrations(id) {
        const client = await pool.connect();
        try {
            // Get event details
            const eventResult = await client.query('SELECT * FROM events WHERE id = $1', [id]);
            if (eventResult.rows.length === 0) {
                return null;
            }

            const event = eventResult.rows[0];

            // Get registered users
            const usersResult = await client.query(`
        SELECT u.id, u.name, u.email, er.registered_at
        FROM users u
        JOIN event_registrations er ON u.id = er.user_id
        WHERE er.event_id = $1
        ORDER BY er.registered_at
      `, [id]);

            return {
                ...event,
                registrations: usersResult.rows
            };
        } finally {
            client.release();
        }
    }

    static async getUpcomingEvents() {
        const client = await pool.connect();
        try {
            const result = await client.query(`
        SELECT e.*, COUNT(er.user_id) as registration_count
        FROM events e
        LEFT JOIN event_registrations er ON e.id = er.event_id
        WHERE e.date_time > NOW()
        GROUP BY e.id
        ORDER BY e.date_time ASC, e.location ASC
      `);
            return result.rows;
        } finally {
            client.release();
        }
    }

    static async getEventStats(eventId) {
        const client = await pool.connect();
        try {
            const result = await client.query(`
        SELECT 
          e.capacity,
          COUNT(er.user_id) as total_registrations,
          (e.capacity - COUNT(er.user_id)) as remaining_capacity,
          ROUND((COUNT(er.user_id)::DECIMAL / e.capacity) * 100, 2) as percentage_used
        FROM events e
        LEFT JOIN event_registrations er ON e.id = er.event_id
        WHERE e.id = $1
        GROUP BY e.id, e.capacity
      `, [eventId]);

            return result.rows[0];
        } finally {
            client.release();
        }
    }

    static async registerUser(eventId, userId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if event exists and is in the future
            const eventResult = await client.query(
                'SELECT * FROM events WHERE id = $1 AND date_time > NOW()',
                [eventId]
            );

            if (eventResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return { success: false, error: 'Event not found or has already passed' };
            }

            const event = eventResult.rows[0];

            // Check if user is already registered
            const existingRegistration = await client.query(
                'SELECT * FROM event_registrations WHERE event_id = $1 AND user_id = $2',
                [eventId, userId]
            );

            if (existingRegistration.rows.length > 0) {
                await client.query('ROLLBACK');
                return { success: false, error: 'User is already registered for this event' };
            }

            // Check if event is full
            const registrationCount = await client.query(
                'SELECT COUNT(*) as count FROM event_registrations WHERE event_id = $1',
                [eventId]
            );

            if (parseInt(registrationCount.rows[0].count) >= event.capacity) {
                await client.query('ROLLBACK');
                return { success: false, error: 'Event is at full capacity' };
            }

            // Register the user
            const result = await client.query(
                'INSERT INTO event_registrations (event_id, user_id) VALUES ($1, $2) RETURNING *',
                [eventId, userId]
            );

            await client.query('COMMIT');
            return { success: true, registration: result.rows[0] };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async cancelRegistration(eventId, userId) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'DELETE FROM event_registrations WHERE event_id = $1 AND user_id = $2 RETURNING *',
                [eventId, userId]
            );

            if (result.rows.length === 0) {
                return { success: false, error: 'Registration not found' };
            }

            return { success: true, cancelledRegistration: result.rows[0] };
        } finally {
            client.release();
        }
    }
}

module.exports = Event;
