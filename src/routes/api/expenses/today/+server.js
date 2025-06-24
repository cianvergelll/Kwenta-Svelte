import { pool } from '$lib/db';

export async function GET() {
    const [rows] = await pool.query(`
    SELECT * FROM expenses 
    WHERE DATE(created_at) = CURDATE()
    ORDER BY created_at DESC
  `);

    return new Response(JSON.stringify(rows));
}