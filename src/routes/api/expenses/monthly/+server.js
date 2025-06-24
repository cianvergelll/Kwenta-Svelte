import { pool } from '$lib/db';

export async function GET({ request }) {
    const [rows] = await pool.query(`
		SELECT category, SUM(expense_amount) as total
		FROM expenses
		WHERE MONTH(created_at) = MONTH(CURDATE())
		AND YEAR(created_at) = YEAR(CURDATE())
		GROUP BY category
	`);

    let categoryMap = {};
    rows.forEach(row => {
        categoryMap[row.category] = row.total;
    });
    return new Response(JSON.stringify(categoryMap));
}
