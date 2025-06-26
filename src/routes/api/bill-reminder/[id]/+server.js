import { pool } from "$lib/db";

export async function PUT({ request, params, locals }) {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { bill_title, bill_amount, due_date, recurring_bill, isPaid, paid_date } = await request.json();


        const [result] = await pool.query(
            'UPDATE bills_reminder SET bill_title = ?, bill_amount = ?, due_date = ?, recurring_bill = ?, isPaid = ?, paid_date = ? WHERE id = ? AND user_id = ?',
            [bill_title, bill_amount, due_date, recurring_bill, isPaid, paid_date, params.id, locals.user.id]
        );

        if (result.affectedRows === 0) {
            return new Response(JSON.stringify({ error: 'Bill reminder not found or not owned by user' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ message: 'Bill reminder updated' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Database error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function DELETE({ params, locals }) {
    if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
    });

    await pool.query('DELETE FROM bills_reminder WHERE id = ? AND user_id = ?', [params.id, locals.user.id]);
    return new Response(JSON.stringify({ message: 'Deleted' }));
}