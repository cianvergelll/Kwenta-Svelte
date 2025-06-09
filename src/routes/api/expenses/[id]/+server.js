import { pool } from '$lib/db';

export async function PUT({ request, params, locals }) {
    if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
    });

    try {
        const { expense_amount, expense_category, expense_note } = await request.json();

        const [result] = await pool.query(
            'UPDATE expenses SET expense_amount = ?, expense_category = ?, expense_note = ? WHERE id = ? AND user_id = ?',
            [expense_amount, expense_category, expense_note, params.id, locals.user.id]
        );

        if (result.affectedRows === 0) {
            return new Response(JSON.stringify({ error: 'Expense not found or not owned by user' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ message: 'Expense updated' }), {
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

    await pool.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [params.id, locals.user.id]);
    return new Response(JSON.stringify({ message: 'Deleted' }));
}