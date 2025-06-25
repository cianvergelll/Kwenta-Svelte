// src/hooks.server.js
import { getServerSession } from '$lib/session';
import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {


    // First get the token from cookies
    let sessionToken = event.cookies.get('sessionToken');

    // Then check Authorization header if no cookie
    if (!sessionToken) {
        const authHeader = event.request.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
            sessionToken = authHeader.split(' ')[1];
        }
    }

    if (sessionToken) {
        try {
            const session = getServerSession(sessionToken);
            if (session) {
                event.locals.user = { id: session.userId };
                console.log('User session set:', event.locals.user);
            }
        } catch (error) {
            console.error('Session error:', error);
            // Clear invalid session
            event.cookies.delete('sessionToken');
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
            throw redirect(303, '/home');
        }
    }

    return await resolve(event);
}

async function initializeNewDay() {
    const today = new Date().toISOString().split('T')[0];

    await pool.query(
        `INSERT INTO daily_status (user_id, date, amount_spent, daily_limit)
     SELECT id, $1, 0, daily_limit 
     FROM users
     ON CONFLICT (user_id, date) DO NOTHING`,
        [today]
    );
}