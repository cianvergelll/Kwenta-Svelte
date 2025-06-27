import { pool } from '$lib/db';

export async function GET({ locals }) {
    if (!locals.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Check if month has changed
        const [monthCheck] = await pool.query(
            `SELECT MAX(created_at) as last_date FROM expenses 
             WHERE user_id = ?`,
            [locals.user.id]
        );

        if (monthCheck[0].last_date &&
            new Date(monthCheck[0].last_date).getMonth() !== new Date().getMonth()) {
            await pool.query(
                `DELETE FROM monthly_cache 
                 WHERE user_id = ?`,
                [locals.user.id]
            );
        }

        const [rows] = await pool.query(`
            SELECT 
                CASE expense_category
                    WHEN 'other' THEN 'others_budget'
                    WHEN 'bills' THEN 'bill_budget'
                    ELSE CONCAT(expense_category, '_budget')
                END as category,
                SUM(expense_amount) as total
            FROM expenses
            WHERE user_id = ?
            AND MONTH(created_at) = MONTH(CURRENT_DATE())
            AND YEAR(created_at) = YEAR(CURRENT_DATE())
            GROUP BY category
        `, [locals.user.id]);

        // Standardize response format
        const categoryMap = {
            food_budget: 0,
            transportation_budget: 0,
            utilities_budget: 0,
            entertainment_budget: 0,
            others_budget: 0,
            bill_budget: 0
        };

        rows.forEach(row => {
            if (categoryMap.hasOwnProperty(row.category)) {
                categoryMap[row.category] = parseFloat(row.total);
            }
        });

        return new Response(JSON.stringify(categoryMap), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            error: 'Failed to fetch monthly expenses'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}