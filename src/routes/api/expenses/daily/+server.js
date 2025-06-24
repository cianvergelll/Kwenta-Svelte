import { pool } from '$lib/db';

export async function GET({ request }) {
  const [rows] = await pool.query(`
		SELECT SUM(expense_amount) as total
		FROM expenses
		WHERE DATE(created_at) = CURDATE()
	`);
  return new Response(JSON.stringify({ total: rows[0].total || 0 }));
}