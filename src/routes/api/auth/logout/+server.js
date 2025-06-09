import { destroySession } from '$lib/session';

export async function POST({ cookies }) {
    const sessionToken = cookies.get('sessionToken');

    if (sessionToken) {
        destroySession(sessionToken);
        cookies.delete('sessionToken', { path: '/' });
    }

    return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}