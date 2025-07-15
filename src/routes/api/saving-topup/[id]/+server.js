import { pool } from "$lib/db";

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

export async function PATCH({ request, params, locals }) {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const partialData = await request.json();

        // Validate at least one field is being updated
        const updatableFields = ['topup_amount'];
        const isValidUpdate = updatableFields.some(field => field in partialData);

        if (!isValidUpdate) {
            return new Response(JSON.stringify({ error: 'No valid fields provided for update' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const setClauses = [];
        const values = [];

        if ('topup_amount' in partialData) {
            setClauses.push('goal_title = ?');
            values.push(partialData.goal_title);
        }

        values.push(params.id, locals.user.id);

        const query = `
            UPDATE saving_goals 
            SET ${setClauses.join(', ')} 
            WHERE id = ? AND user_id = ?
        `;

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return new Response(JSON.stringify({ error: 'Saving goal not found or not owned by user' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ message: 'Saving goal partially updated' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('PATCH error:', error);
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