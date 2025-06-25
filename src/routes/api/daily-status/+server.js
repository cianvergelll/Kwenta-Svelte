import { json } from '@sveltejs/kit';
import { pool } from '$lib/db';

export async function GET({ request, locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');

    try {
        const [rows] = await pool.query(
            `SELECT 
                date, 
                amount_spent, 
                daily_limit,
                status
             FROM daily_status 
             WHERE user_id = ? 
             AND MONTH(date) = ? 
             AND YEAR(date) = ?`,
            [locals.user.id, month, year]
        );

        return json(rows);
    } catch (err) {
        console.error('GET Error:', err);
        return json({ error: err.message }, { status: 500 });
    }
}

export async function POST({ request, locals }) {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, amount_spent, daily_limit } = await request.json();

    try {
        await pool.query(
            `INSERT INTO daily_status (user_id, date, amount_spent, daily_limit)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               amount_spent = VALUES(amount_spent),
               daily_limit = VALUES(daily_limit)`,
            [locals.user.id, date, amount_spent, daily_limit]
        );

        return json({ success: true });
    } catch (err) {
        console.error('POST Error:', err);
        return json({ error: err.message }, { status: 500 });
    }
}