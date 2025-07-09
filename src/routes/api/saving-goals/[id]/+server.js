import { pool } from "$lib/db";

export async function PUT({ request, params, locals }) {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { goal_title, goal_amount, current_amount, goal_date, isCompleted } = await request.json();

        const [result] = await pool.query(
            'UPDATE saving_goals SET goal_title = ?, goal_amount = ?, current_amount = ?, goal_date = ?, isCompleted = ? WHERE id = ? AND user_id = ?',
            [goal_title, goal_amount, current_amount, goal_date, isCompleted, params.id, locals.user.id]
        );

        if (result.affectedRows === 0) {
            return new Response(JSON.stringify({ error: 'Saving goal not found or not owned by user' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ message: 'Saving goal updated' }), {
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