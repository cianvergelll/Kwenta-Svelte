import { pool } from "$lib/db";

export async function GET({ locals }) {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM savings_topup WHERE user_id = ?', [locals.user.id]);

        return new Response(JSON.stringify(rows), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch top ups' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function POST({ request, locals }) {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { topup_amount } = await request.json();

        const result = await pool.query(
            'INSERT INTO savings_topup (user_id, topup_amount) VALUES (?)',
            [locals.user.id, topup_amount]
        );

        return new Response(JSON.stringify({
            message: 'Top up added',
            id: result.insertId
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to add top up' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}