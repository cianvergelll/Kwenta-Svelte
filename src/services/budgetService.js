import { getAuthHeaders } from './authService';

export async function getBudgetData() {
    const res = await fetch('api/budget-planner', {
        headers: await getAuthHeaders()
    });

    if (!res.ok) throw new Error(await res.text());
    return await res.json();
}