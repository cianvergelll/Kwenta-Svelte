<script>
	import SideNav from '../../components/sideNav.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ExpenseModal from '../../components/ExpenseModal.svelte';
	import Chart from '../../components/Chart.svelte';

	let expenses = $state([]);
	let expense_amount = $state('');
	let expense_category = $state('');
	let expense_note = $state('');
	let errorMessage = $state('');
	let isLoading = $state(false);
	let expensesList = $state(null);

	let showModal = $state(false);
	let editingExpenses = $state(null);
	let modalCategory = $state('');
	let modalAmount = $state('');
	let modalNote = $state('');

	function openEditModal(expense) {
		editingExpenses = expense;
		modalCategory = expense.expense_category;
		modalAmount = expense.expense_amount;
		modalNote = expense.expense_note;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingExpenses = null;
		modalAmount = '';
		modalCategory = '';
		modalNote = '';
	}

	async function saveExpense() {
		if (!editingExpenses) return;

		try {
			const res = await fetch(`/api/expenses/${editingExpenses.id}`, {
				method: 'PUT',
				headers: await getAuthHeaders(),
				body: JSON.stringify({
					expense_amount: modalAmount,
					expense_category: modalCategory,
					expense_note: modalNote
				})
			});

			if (!res.ok) {
				const err = await res.json();
				errorMessage = err.error || 'Failed to update expense';
				return;
			}

			closeModal();
			await loadExpenses();
		} catch (error) {
			console.error('Error updating expense:', error);
			errorMessage = 'Network error while updating';
		}
	}

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

			await loadExpenses();
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

	async function loadExpenses() {
		isLoading = true;
		errorMessage = '';
		try {
			const res = await fetch('/api/expenses', {
				headers: await getAuthHeaders()
			});

			if (!res.ok) {
				const err = await res.json();
				errorMessage = err.error || 'Failed to load expenses';
				return;
			}

			expenses = await res.json();
		} catch (error) {
			console.error('Error loading expenses:', error);
			errorMessage = 'Network error';
		} finally {
			isLoading = false;
		}
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
			await loadExpenses();
		} catch (error) {
			console.error('Error adding expenses:', error);
			errorMessage = 'Network error';
		}
	}

	async function deleteExpense(id) {
		if (!confirm('Are you sure you want to delete this expense?')) return;

		try {
			const res = await fetch(`/api/expenses/${id}`, {
				method: 'DELETE',
				headers: await getAuthHeaders()
			});

			if (!res.ok) {
				const err = await res.json();
				errorMessage = err.error || 'Failed to delete expense';
				return;
			}

			await loadExpenses();
		} catch (error) {
			console.error('Error deleting expense:', error);
			errorMessage = 'Network error';
		}
	}

	function reloadChart() {
		// Add your reload logic here
		console.log('Reloading chart data...');
		// You might want to fetch new data here and update the chartData
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
						class={`${inputStyle} bg-transparent`}
						required
					>
						<option value="" disabled selected>Select a category</option>
						<option value="food" class="text-black">Food</option>
						<option value="transportation" class="text-black">Transportation</option>
						<option value="utilities" class="text-black">Utilities</option>
						<option value="entertainment" class="text-black">Entertainment</option>
						<option value="other" class="text-black">Other</option>
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
							preventdefault
							class="w-[40%] rounded-lg bg-white py-2 font-bold text-green-800 transition duration-300 hover:bg-green-700 hover:text-white"
						>
							Add Expense
						</button>
					</div>
				</form>
			</div>
		</div>

		<div
			class="my-auto flex h-[40%] flex-col items-center justify-center overflow-hidden rounded-xl bg-white shadow-xl"
		></div>
	</div>

	<div class="mr-5 h-[95%] w-[40%] rounded-lg border border-gray-300 bg-white">
		<div class="h-[50%] w-full">
			<Chart
				title="Expense Breakdown"
				chartLabels={['Food', 'Transportation', 'Utilities', 'Entertainment', 'Other']}
				chartData={[1000, 500, 800, 300, 200]}
				dataLabel="Amount Spent"
				chartType="bar"
				onReload={reloadChart}
			/>
		</div>
		<div class="h-[50%] w-full bg-white">
			<div class="relative mt-3 flex h-full w-full flex-col items-center justify-center">
				{#if isLoading && expenses.length === 0}
					<div class="py-8 text-center">Loading expenses...</div>
				{:else}
					<div class="relative h-full w-full">
						<ul
							bind:this={expensesList}
							class="my-3 flex max-h-65 w-full flex-col items-center space-y-4 overflow-y-auto pr-2"
						>
							{#each expenses as expense}
								<li
									class={`flex w-[95%] items-center justify-between rounded-lg p-4 shadow
                    ${
											expense.expense_category === 'utilities'
												? 'bg-gradient-to-r from-blue-500 to-blue-800'
												: expense.expense_category === 'food'
													? 'bg-gradient-to-r from-pink-500 to-pink-800'
													: expense.expense_category === 'transportation'
														? 'bg-gradient-to-r from-yellow-500 to-yellow-800'
														: expense.expense_category === 'entertainment'
															? 'bg-gradient-to-r from-purple-500 to-purple-800'
															: expense.expense_category === 'other'
																? 'bg-gradient-to-r from-gray-400 to-gray-700'
																: 'bg-gray-50'
										}
                  `}
								>
									<!-- Left: Expense details in column -->
									<div class="flex flex-col">
										<span class="text-base text-white">
											{expense.expense_category.charAt(0).toUpperCase() +
												expense.expense_category.slice(1)}
										</span>
										<span class="text-2xl font-bold text-white">₱{expense.expense_amount}</span>
										<span class="text-sm text-white">{expense.expense_note}</span>
									</div>
									<!-- Right: Buttons in row, justified end -->
									<div class="flex flex-row justify-end space-x-2">
										<button
											class="rounded bg-yellow-500 px-3 py-1 text-white transition-colors hover:bg-yellow-600"
											onclick={() => openEditModal(expense)}
										>
											Edit
										</button>
										<button
											onclick={() => deleteExpense(expense.id)}
											class="rounded bg-red-600 px-3 py-1 text-white transition-colors hover:bg-red-700"
										>
											Delete
										</button>
									</div>
								</li>
							{/each}
						</ul>
						<h1 class="text-center text-xl font-bold text-green-600">
							TOTAL MONEY SPENT TODAY: ₱
							{expenses
								.reduce((total, expense) => total + Number(expense.expense_amount), 0)
								.toFixed(2)}
						</h1>
					</div>
				{/if}

				<ExpenseModal
					bind:showModal
					bind:editingExpenses
					bind:modalCategory
					bind:modalAmount
					bind:modalNote
					{closeModal}
					{saveExpense}
				/>
			</div>
		</div>
	</div>
</div>
