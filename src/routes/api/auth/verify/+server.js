import { getServerSession } from '$lib/session';

export async function GET({ request, locals }) {
    if (!locals.user) {
        return new Response(JSON.stringify({ valid: false }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ valid: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}