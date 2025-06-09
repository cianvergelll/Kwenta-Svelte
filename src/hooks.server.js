import { getServerSession } from '$lib/session';
import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
    // Get session token from cookies or Authorization header
    const sessionToken = event.cookies.get('sessionToken') ||
        event.request.headers.get('Authorization')?.split(' ')[1];

    if (sessionToken) {
        const session = getServerSession(sessionToken);
        if (session) {
            event.locals.user = { id: session.userId };
        }
    }

    if (event.url.pathname.startsWith('/dashboard')) {
        if (!event.locals.user) {
            throw redirect(303, '/login');
        }
    }

    // Check if user is trying to access auth routes while logged in
    if (['/login', '/register'].includes(event.url.pathname)) {
        if (event.locals.user) {
            throw redirect(303, '/dashboard');
        }
    }

    const response = await resolve(event);
    return response;
}