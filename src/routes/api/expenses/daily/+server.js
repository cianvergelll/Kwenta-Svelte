import { pool } from '$lib/db';

export async function GET({ locals }) {
	if (!locals.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const [rows] = await pool.query(`
            SELECT SUM(expense_amount) as total
            FROM expenses
            WHERE DATE(created_at) = CURDATE()
            AND user_id = ?
        `, [locals.user.id]);

		return new Response(JSON.stringify({
			total: rows[0].total || 0
		}), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({
			error: 'Failed to fetch daily expenses'
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}