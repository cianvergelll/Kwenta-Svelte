// src/hooks.server.js
import { getServerSession } from '$lib/session';
import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
    // Get session token from cookies or Authorization header
    const authHeader = event.request.headers.get('Authorization');
    const sessionToken = event.cookies.get('sessionToken') ||
        (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (sessionToken) {
        try {
            const session = await getServerSession(sessionToken);
            if (session) {
                event.locals.user = { id: session.userId };
            }
        } catch (error) {
            console.error('Session verification error:', error);
        }
    }

    // Route protection
    if (event.url.pathname.startsWith('/home') || event.url.pathname === '/home') {
        if (!event.locals.user) {
            throw redirect(303, '/login');
        }
    }

    if (['/login', '/register'].includes(event.url.pathname)) {
        if (event.locals.user) {
            throw redirect(303, '/dashboard');
        }
    }

    return await resolve(event);
}