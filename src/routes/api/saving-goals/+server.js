import { pool } from "$lib/db";

export async function GET({ locals }) {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM saving_goals WHERE user_id = ?', [locals.user.id]);

        const formattedRows = rows.map(row => ({
            id: row.id,
            goal_title: row.goal_title,
            goal_amount: row.goal_amount,
            current_amount: row.current_amount,
            goal_date: row.goal_date,
            isCompleted: row.isCompleted
        }));

        return new Response(JSON.stringify(formattedRows), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch saving goals' }), {
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
        const { goal_title, goal_amount, current_amount, goal_date, isCompleted } = await request.json();

        const result = await pool.query(
            'INSERT INTO saving_goals (user_id, goal_title, goal_amount, current_amount, goal_date, isCompleted) VALUES (?, ?, ?, ?, ?, ?)',
            [locals.user.id, goal_title, goal_amount, current_amount, goal_date, isCompleted]
        );

        return new Response(JSON.stringify({
            message: 'Saving goal added',
            id: result.insertId
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to add saving goal' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}