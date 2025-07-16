import { pool } from "$lib/db";

export async function GET({ params, locals }) {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const [rows] = await pool.query(`
            SELECT * FROM savings_topup 
            WHERE goal_id = ? AND user_id = ?
            ORDER BY created_at DESC
        `, [params.id, locals.user.id]);

        return new Response(JSON.stringify(rows), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("GET top-ups error:", error);
        return new Response(JSON.stringify({ error: 'Failed to fetch top ups' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function PUT({ request, params, locals }) {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { topup_amount } = await request.json();

        const [result] = await pool.query(
            'UPDATE savings_topups SET topup_amount = ? WHERE id = ? AND user_id = ?',
            [topup_amount, params.id, locals.user.id]
        );

        if (result.affectedRows === 0) {
            return new Response(JSON.stringify({ error: 'No top ups added' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ message: 'Savings updated' }), {
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
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        await pool.query('DELETE FROM saving_goals WHERE id = ? AND user_id = ?', [params.id, locals.user.id]);
        return new Response(JSON.stringify({ message: 'Saving goal deleted' }), {
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