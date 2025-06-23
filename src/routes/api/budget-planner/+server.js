import { pool } from '$lib/db';

export async function GET({ locals }) {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const [rows] = await pool.query('SELECT * from budget_plan WHERE user_id = ?', [locals.user.id]);
        return new Response(JSON.stringify(rows), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch budget plan' }), {
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
        const { total_budget, daily_limit, food_budget, transportation_budget, utilities_budget, entertainment_budget, others_budget } = await request.json();

        await pool.query('INSERT INTO budget_plan (user_id, total_budget, daily_limit, food_budget, transportation_budget, utilities_budget, entertainment_budget, others_budget) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [locals.user.id, total_budget, daily_limit, food_budget, transportation_budget, utilities_budget, entertainment_budget, others_budget]);

        return new Response(JSON.stringify({ message: 'Budget plan added' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to add expense' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}