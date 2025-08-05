export function getAuthHeaders() {
    const token = localStorage.getItem('sessionToken');
    if (!token) throw new Error('No session token found');

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };
}

export async function verifySession(token) {
    const res = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
        localStorage.removeItem('sessionToken');
        throw new Error('Session verification failed');
    }
}