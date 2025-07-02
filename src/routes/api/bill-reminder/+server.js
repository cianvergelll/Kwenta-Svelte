import { pool } from "$lib/db";

export async function GET({ locals }) {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const [rows] = await pool.query('SELECT * from bills_reminder WHERE user_id = ?', [locals.user.id]);

        const formattedRows = rows.map(row => ({
            id: row.id,
            bill_title: row.bill_title,
            bill_amount: row.bill_amount,
            due_date: row.due_date,
            recurring_bill: row.recurring_bill,
            isPaid: row.isPaid,
            paid_date: row.paid_date,
            expense_id: row.expense_id
        }));

        return new Response(JSON.stringify(formattedRows), {
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
        const requestData = await request.json();

        const { bill_title, bill_amount, due_date, recurring_bill, isPaid, paid_date, expense_id } = requestData; // Use the parsed data

        const result = await pool.query(
            'INSERT INTO bills_reminder (user_id, bill_title, bill_amount, due_date, recurring_bill, isPaid, paid_date, expense_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [locals.user.id, bill_title, bill_amount, due_date, recurring_bill, isPaid, paid_date || null, expense_id || null]
        );

        return new Response(JSON.stringify({ message: 'Bill reminder added' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Full POST error:', error);
        return new Response(JSON.stringify({ error: 'Failed to add bill reminder' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}