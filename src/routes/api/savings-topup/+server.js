import { pool } from "$lib/db";

export async function POST({ request, locals }) {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { goal_id, topup_amount } = await request.json();

        const [result] = await pool.query(
            'INSERT INTO savings_topup (user_id, goal_id, topup_amount) VALUES (?, ?, ?)',
            [locals.user.id, goal_id, topup_amount]
        );

        await pool.query(
            'UPDATE saving_goals SET current_amount = current_amount + ? WHERE id = ? AND user_id = ?',
            [topup_amount, goal_id, locals.user.id]
        );
        return new Response(JSON.stringify({ message: 'Top up added' }), {
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