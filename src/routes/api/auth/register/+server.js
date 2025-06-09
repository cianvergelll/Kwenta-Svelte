import { pool } from '$lib/db.js';

export async function POST({ request }) {
    const { name, email, password } = await request.json();
    const [result] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
    return new Response(JSON.stringify({ id: result.insertId }), { status: 201 });
}