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
        const updatableFields = ['goal_title', 'goal_amount', 'current_amount', 'goal_date', 'isCompleted'];
        const isValidUpdate = updatableFields.some(field => field in partialData);

        if (!isValidUpdate) {
            return new Response(JSON.stringify({ error: 'No valid fields provided for update' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Dynamic SQL construction for partial update
        const setClauses = [];
        const values = [];

        if ('goal_title' in partialData) {
            setClauses.push('goal_title = ?');
            values.push(partialData.goal_title);
        }
        if ('goal_amount' in partialData) {
            setClauses.push('goal_amount = ?');
            values.push(partialData.goal_amount);
        }
        if ('current_amount' in partialData) {
            setClauses.push('current_amount = ?');
            values.push(partialData.current_amount);
        }
        if ('goal_date' in partialData) {
            setClauses.push('goal_date = ?');
            values.push(partialData.goal_date);
        }
        if ('isCompleted' in partialData) {
            setClauses.push('isCompleted = ?');
            values.push(partialData.isCompleted);
        }

        // Add ID and user_id for WHERE clause
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