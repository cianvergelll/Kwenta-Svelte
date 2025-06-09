import { pool } from '$lib/db.js';
import { createSession } from '$lib/session.js';

export async function POST({ request, cookies }) {
    const { username, password } = await request.json();

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        // In a real app, you should hash passwords and verify with bcrypt
        if (rows.length === 0 || rows[0].password !== password) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const sessionToken = createSession(rows[0].id);

        cookies.set('sessionToken', sessionToken, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 1 day
        });

        return new Response(JSON.stringify({
            message: 'Logged in successfully',
            user: { id: rows[0].id, username: rows[0].username }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'Login failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}