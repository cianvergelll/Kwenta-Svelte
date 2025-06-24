import { pool } from '$lib/db.js';
import { createSession } from '$lib/session.js';

export async function POST({ request, cookies }) {
    const { email, password } = await request.json();

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0 || rows[0].password !== password) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const sessionToken = createSession(rows[0].user_id);

        cookies.set('sessionToken', sessionToken, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24
        });

        return new Response(JSON.stringify({
            message: 'Logged in successfully',
            user: { id: rows[0].user_id, email: rows[0].email }
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