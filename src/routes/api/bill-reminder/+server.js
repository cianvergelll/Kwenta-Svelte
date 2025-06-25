import { pool } from "$lib/db";

export async function GET({ locals }) {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const [rows] = await pool.query('SELECT * from bill_reminder WHERE user_id = ?', [locals.user.id]);
        return new Response(JSON.stringify(rows), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch bill reminder' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
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
        const { bill_title, bill_amount, due_date, recurring_bill, isPaid } = await request.json();

        await pool.query(
            'INSERT INTO bill_reminder (user_id, bill_title, bill_amount, due_date, recurring_bill, isPaid) VALUES (?, ?, ?, ?, ?, ?)',
            [locals.user.id, bill_title, bill_amount, due_date, recurring_bill, isPaid]
        );

        return new Response(JSON.stringify({ message: 'Bill reminder added' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to add bill reminder' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}