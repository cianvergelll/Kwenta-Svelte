import { pool } from '$lib/db';

export async function GET({ locals }) {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM expenses WHERE user_id = ?', [locals.user.id]);
        return new Response(JSON.stringify(rows), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch expense list' }), {
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
        const { expense_amount, expense_category, expense_note } = await request.json();

        await pool.query(
            'INSERT INTO tasks (user_id, expense_amount, expense_category, expense_note) VALUES (?, ?, ?, ?)',
            [locals.user.id, expense_amount, expense_category, expense_note]
        );

        return new Response(JSON.stringify({ message: 'Expense added' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to add expense' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}