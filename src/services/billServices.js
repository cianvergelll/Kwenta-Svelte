import { getAuthHeaders } from './authService';

export async function getBills() {
    const res = await fetch('/api/bill-reminder', {
        headers: await getAuthHeaders()
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to load bills');
    }
    return await res.json();
}

export async function markAsPaid(bill) {
    const expenseRes = await fetch('api/expenses', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
            expense_amount: bill.bill_amount,
            expense_category: 'Bills',
            expense_note: bill.bill_title
        })
    });

    if (!expenseRes.ok) throw new Error('Failed to create expense');
    const expenseData = await expenseRes.json();

    const res = await fetch(`/api/bill-reminder/${bill.id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
            ...bill,
            isPaid: 1,
            paid_date: new Date().toISOString().split('T')[0],
            expense_id: expenseData.id
        })
    });

    if (!res.ok) throw new Error('Failed to mark as paid');

    if (bill.recurring_bill) {
        const currentDueDate = new Date(bill.due_date);
        const nextDueDate = new Date(currentDueDate.setMonth(currentDueDate.getMonth() + 1))
            .toISOString()
            .split('T')[0];

        await fetch('/api/bill-reminder', {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify({
                bill_title: bill.bill_title,
                bill_amount: bill.bill_amount,
                due_date: nextDueDate,
                recurring_bill: true,
                isPaid: false,
                paid_date: null,
                expense_id: null
            })
        });
    }

    return res.json();
}

export async function markAsUnpaid(bill) {
    const res = await fetch(`/api/bill-reminder/${bill.id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
            ...bill,
            isPaid: false,
            paid_date: null
        })
    });

    if (!res.ok) throw new Error('Failed to mark as unpaid');

    if (bill.expense_id) {
        const deleteRes = await fetch(`/api/expenses/${bill.expense_id}`, {
            method: 'DELETE',
            headers: await getAuthHeaders()
        });

        if (!deleteRes.ok) throw new Error('Failed to remove expense');
    }

    return res.json();
}

export async function toggleRecurring(bill) {
    const res = await fetch(`/api/bill-reminder/${bill.id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
            ...bill,
            recurring_bill: !bill.recurring_bill
        })
    });

    if (!res.ok) throw new Error('Failed to toggle recurring status');
    return res.json();
}

export async function addBill(billData) {
    const res = await fetch('/api/bill-reminder', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(billData)
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add bill');
    }
    return res.json();
}

export async function updateBill(bill) {
    // Ensure we're only sending necessary fields
    const updateData = {
        bill_title: bill.bill_title,
        bill_amount: bill.bill_amount,
        due_date: bill.due_date,
        recurring_bill: bill.recurring_bill
        // Don't include isPaid/paid_date unless changing them
    };

    const res = await fetch(`/api/bill-reminder/${bill.id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify(updateData)
    });

    if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error:', errorData); // Detailed error logging
        throw new Error(errorData.message || 'Failed to update bill');
    }
    return res.json();
}

export async function deleteBill(id) {
    const res = await fetch(`/api/bill-reminder/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders()
    });

    if (!res.ok) throw new Error('Failed to delete bill');
    return res.json();
}