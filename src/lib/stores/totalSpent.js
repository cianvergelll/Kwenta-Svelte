import { writable } from 'svelte/store';

// Initialize with localStorage value if available
const storedTotal = typeof localStorage !== 'undefined' ?
    parseFloat(localStorage.getItem('totalSpent')) || 0 : 0;

export const totalSpent = writable(storedTotal);

if (typeof localStorage !== 'undefined') {
    totalSpent.subscribe(value => {
        localStorage.setItem('totalSpent', value.toString());
    });
}