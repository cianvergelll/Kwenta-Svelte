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

    let { date, amount_spent, daily_limit } = await request.json();

    // Ensure the date is in YYYY-MM-DD format
    if (date && typeof date === 'string') {
        date = new Date(date).toISOString().split('T')[0];
    } else if (!date) {
        // Default to today if no date provided
        date = new Date().toISOString().split('T')[0];
    }

    try {
        await pool.query(
            `INSERT INTO daily_status (user_id, date, amount_spent, daily_limit, status)
             VALUES (?, ?, ?, ?, 
                CASE 
                    WHEN ? <= ? * 0.8 THEN 'on_track'
                    WHEN ? <= ? THEN 'caution'
                    ELSE 'overspending'
                END)
             ON DUPLICATE KEY UPDATE
                amount_spent = VALUES(amount_spent),
                daily_limit = VALUES(daily_limit),
                status = VALUES(status)`,
            [locals.user.id, date, amount_spent, daily_limit,
                amount_spent, daily_limit, amount_spent, daily_limit]
        );

        return json({ success: true });
    } catch (err) {
        console.error('POST Error:', err);
        return json({ error: err.message }, { status: 500 });
    }
}