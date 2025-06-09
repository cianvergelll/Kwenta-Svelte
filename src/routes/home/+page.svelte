<script>
	import SideNav from '../../components/sideNav.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let tasks = $state([]);
	let expense_amount = $state('');
	let expense_category = $state('');
	let expense_note = $state('');
	let errorMessage = $state('');
	let isLoading = $state(false);

	onMount(async () => {
		const token = localStorage.getItem('sessionToken');
		if (!token) {
			goto('/login');
			return;
		}

		try {
			const res = await fetch('/api/auth/verify', {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (!res.ok) {
				localStorage.removeItem('sessionToken');
				goto('/login');
				return;
			}

			// await loadTasks();
		} catch (error) {
			console.error('Session verification failed:', error);
			goto('/login');
		}
	});

	async function getAuthHeaders() {
		const token = localStorage.getItem('sessionToken');
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		};
	}

	async function addExpense() {
		errorMessage = '';
		try {
			const res = await fetch('/api/expenses', {
				method: 'POST',
				headers: await getAuthHeaders(),
				body: JSON.stringify({ expense_amount, expense_category, expense_note })
			});

			if (!res.ok) {
				const err = await res.json();
				errorMessage = err.error || 'Failed to add expense';
				return;
			}

			expense_amount = '';
			expense_category = '';
			expense_note = '';
			await loadTasks();
		} catch (error) {
			console.error('Error adding task:', error);
			errorMessage = 'Network error';
		}
	}

	const inputStyle =
		'w-[90%] py-2 border border-white rounded-lg pl-4 mb-2 text-white placeholder:text-white';
</script>

<div class="flex h-screen w-screen items-center justify-start bg-gray-100">
	<div class="ml-5 flex h-[95%] w-1/5 flex-col rounded-xl shadow-lg">
		<SideNav />
	</div>

	<div class="mx-auto flex h-[95%] w-[35%] flex-col">
		<p class="mt-5 pl-5 text-2xl font-bold text-green-700">Good Day, User!<br /></p>
		<p class="pl-5 text-green-700">Let's start your overseeing your expenses.</p>
		<div class="my-auto h-[40%] rounded-xl bg-gradient-to-r from-green-600 to-green-800 shadow-xl">
			<div class="flex h-full flex-col items-center justify-center">
				<form
					onsubmit={addExpense}
					class="flex h-full w-full flex-col items-center justify-center space-y-4"
				>
					<label for="expense-amount" class="text-m mb-2 self-start pl-[5%] text-white"
						>Add expense amount</label
					>
					<input
						id="expense-amount"
						type="number"
						bind:value={expense_amount}
						placeholder="₱ 00.00"
						class={`${inputStyle} bg-transparent text-center text-3xl font-bold text-white placeholder:text-3xl placeholder:font-bold`}
						required
					/>

					<select
						id="expense-category"
						bind:value={expense_category}
						placeholder="Select Category"
						class={`${inputStyle} bg-transparent text-white`}
					>
						<option value="" disabled selected>Select a category</option>
						<option value="food">Food</option>
						<option value="transportation">Transportation</option>
						<option value="utilities">Utilities</option>
						<option value="entertainment">Entertainment</option>
						<option value="other">Other</option>
					</select>

					<input
						type="text"
						bind:value={expense_note}
						placeholder="Add note..."
						class="mb-2 w-[90%] rounded-lg border border-white py-2 pl-4 text-gray-800 placeholder:text-gray-400"
						required
					/>
					<div class="mr-15 flex w-full justify-end">
						<button
							type="submit"
							onclick={addExpense}
							class="w-[40%] rounded-lg bg-white py-2 font-bold text-green-800 transition duration-300 hover:bg-green-700 hover:text-white"
						>
							Add Expense
						</button>
					</div>
				</form>
			</div>
		</div>

		<div
			class="my-auto flex h-[40%] flex-col items-center justify-center rounded-xl bg-white shadow-xl"
		>
			<div class="flex h-[50%] w-full items-center justify-center">
				<p class="text-xl font-bold text-green-700">Total Expenses</p>
			</div>
		</div>
	</div>

	<div class="mr-5 h-[95%] w-[40%] rounded-lg border border-gray-300 shadow-xl"></div>
</div>
