<script>
	import { goto } from '$app/navigation';
	const tabs =
		'bg-gradient-to-r from-green-500 to-green-800 text-white mb-3 w-[95%] font-bold text-lg py-3 text-center rounded-lg mb-2 hover:from-green-800 hover:to-green-500 transition duration-250 hover:scale-105';

	async function getAuthHeaders() {
		const token = localStorage.getItem('sessionToken');
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		};
	}

	export let errorMessage = '';
	async function logout() {
		try {
			const res = await fetch('/api/auth/logout', {
				method: 'POST',
				headers: await getAuthHeaders()
			});

			if (res.ok) {
				localStorage.removeItem('sessionToken');
				goto('/login');
			} else {
				const err = await res.json();
				errorMessage = err.error || 'Logout failed';
			}
		} catch (error) {
			console.error('Logout error:', error);
			errorMessage = 'Network error during logout';
		}
	}
</script>

<div class="flex h-full w-full flex-col rounded-2xl bg-white shadow-2xl">
	<ul class="flex flex-col items-center justify-start space-y-2 p-4">
		<li class={`${tabs} mt-3`}><a href="/home">Expenses</a></li>
		<li class={tabs}><a href="/budget-planner">Budget Planner</a></li>
		<li class={tabs}><a href="foo">Bills Reminder</a></li>
		<li class={tabs}><a href="foo">History</a></li>
		<li class={tabs}><a href="foo">Notifications</a></li>
		<li class={`${tabs} mt-55`}><a href="foo">Settings</a></li>
		<button
			onclick={logout}
			class="w-[95%] rounded-lg bg-red-500 py-3 text-lg font-bold text-white transition duration-250 hover:scale-105 hover:bg-red-600"
			>Logout</button
		>
	</ul>
</div>
