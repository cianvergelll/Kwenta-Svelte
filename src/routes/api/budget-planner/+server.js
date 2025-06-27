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
        // Check if budget plan already exists for this user
        const [existingBudget] = await pool.query(
            'SELECT * FROM budget_plan WHERE user_id = ?',
            [locals.user.id]
        );

        if (existingBudget && existingBudget.length > 0) {
            return new Response(JSON.stringify({ error: 'Budget plan already exists' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const {
            total_budget,
            daily_limit,
            food_budget,
            transportation_budget,
            utilities_budget,
            entertainment_budget,
            others_budget,
            bills_budget
        } = await request.json();

        await pool.query(
            'INSERT INTO budget_plan (user_id, total_budget, daily_limit, food_budget, transportation_budget, utilities_budget, entertainment_budget, others_budget, bills_budget) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                locals.user.id,
                total_budget,
                daily_limit,
                food_budget,
                transportation_budget,
                utilities_budget,
                entertainment_budget,
                others_budget,
                bills_budget
            ]
        );

        return new Response(JSON.stringify({ message: 'Budget plan added' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Failed to add budget:', error);
        return new Response(JSON.stringify({
            error: 'Failed to add budget',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function PUT({ request, locals }) {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const {
            total_budget,
            daily_limit,
            food_budget,
            transportation_budget,
            utilities_budget,
            entertainment_budget,
            others_budget,
            bills_budget
        } = await request.json();

        await pool.query(
            'UPDATE budget_plan SET total_budget = ?, daily_limit = ?, food_budget = ?, transportation_budget = ?, utilities_budget = ?, entertainment_budget = ?, others_budget = ?, bills_budget = ? WHERE user_id = ?',
            [
                total_budget,
                daily_limit,
                food_budget,
                transportation_budget,
                utilities_budget,
                entertainment_budget,
                others_budget,
                bills_budget,
                locals.user.id
            ]
        );

        return new Response(JSON.stringify({ message: 'Budget plan updated' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Failed to update budget:', error);
        return new Response(JSON.stringify({
            error: 'Failed to update budget',
            details: error.message
        }), {
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