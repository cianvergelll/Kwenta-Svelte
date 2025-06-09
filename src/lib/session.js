const sessions = new Map();

export function createSession(userId) {
    const token = crypto.randomUUID();
    sessions.set(token, { userId, createdAt: Date.now() });
    return token;
}

export function getServerSession(token) {
    if (!token) return null;
    return sessions.get(token);
}

export function destroySession(token) {
    sessions.delete(token);
}