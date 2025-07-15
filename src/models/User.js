const pool = require('../database/config');

class User {
    static async create(name, email) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
                [name, email]
            );
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    static async findById(id) {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    static async findByEmail(email) {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    static async findAll() {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM users ORDER BY created_at DESC');
            return result.rows;
        } finally {
            client.release();
        }
    }
}

module.exports = User;
