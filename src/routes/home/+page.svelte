<script>
	import SideNav from '../../components/sideNav.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ExpenseModal from '../../components/ExpenseModal.svelte';
	import Chart from '../../components/Chart.svelte';
	import { totalSpent } from '../../lib/stores/totalSpent';
	import CategoryBudget from '../../components/CategoryBudget.svelte';

	let category_budgets = $state([]);
	let categories = [
		{ name: 'food_budget', label: 'Food' },
		{ name: 'transportation_budget', label: 'Transportation' },
		{ name: 'utilities_budget', label: 'Utilities' },
		{ name: 'entertainment_budget', label: 'Entertainment' },
		{ name: 'others_budget', label: 'Others' },
		{ name: 'bills_budget', label: 'Bills' }
	];
	let categorySpending = $state({});
	let isEditMode = $state(false);
	let sortDropdownOpen = $state(false);
	let currentSortMethod = $state('date-desc');
	let currentMonthExpenses = $state([]);

	function removeBudget(id) {
		category_budgets = category_budgets.filter((item) => item.id !== id);
		if (category_budgets.length === 0 && !total_budget && !daily_limit) {
			has_data = false;
		}
	}

	async function fetchDailyExpenses() {
		try {
			const res = await fetch('/api/expenses/daily');
			if (!res.ok) throw new Error('Failed to fetch daily expenses');
			const { total } = await res.json();
			daily_spent = total || 0;
		} catch (err) {
			console.error('Daily expenses fetch error:', err);
		}
	}

	async function fetchMonthlyCategoryExpenses() {
		try {
			const res = await fetch('/api/expenses/monthly');
			if (!res.ok) throw new Error('Failed to fetch monthly expenses');
			categorySpending = await res.json();
		} catch (err) {
			console.error('Monthly expenses fetch error:', err);
		}
	}

	function getCategoryColor(category) {
		switch (category) {
			case 'utilities_budget':
				return 'bg-gradient-to-r from-blue-500 to-blue-800';
			case 'food_budget':
				return 'bg-gradient-to-r from-pink-500 to-pink-800';
			case 'transportation_budget':
				return 'bg-gradient-to-r from-yellow-500 to-yellow-800';
			case 'entertainment_budget':
				return 'bg-gradient-to-r from-purple-500 to-purple-800';
			case 'others_budget':
				return 'bg-gradient-to-r from-gray-400 to-gray-700';
			case 'bills_budget':
				return 'bg-gradient-to-r from-green-400 to-green-700';
			default:
				return 'bg-gray-50';
		}
	}

	let expenses = $state([]);
	let expense_amount = $state('');
	let expense_category = $state('');
	let expense_note = $state('');
	let errorMessage = $state('');
	let isLoading = $state(false);
	let expensesList = $state(null);
	let originalBudgetData = $state(null);
	let total_budget = $state('');
	let daily_limit = $state('');
	let daily_spent = $state(0);
	let isOnPage = $state(false);

	$effect(() => {
		const now = new Date();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();

		const currentMonthTotal = expenses
			.filter((expense) => {
				const expenseDate = new Date(expense.created_at || expense.date);
				return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
			})
			.reduce((sum, expense) => sum + Number(expense.expense_amount), 0)
			.toFixed(2);

		$totalSpent = currentMonthTotal;
	});

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
			await fetchMonthlyCategoryExpenses();
		} catch (error) {
			console.error('Error updating expense:', error);
			errorMessage = 'Network error while updating';
		}
	}

	function processAndSortExpenses() {
		const now = new Date();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();

		currentMonthExpenses = expenses.filter((expense) => {
			const expenseDate = new Date(expense.created_at || expense.date);
			return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
		});

		switch (currentSortMethod) {
			case 'date-desc':
				currentMonthExpenses.sort(
					(a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)
				);
				break;
			case 'date-asc':
				currentMonthExpenses.sort(
					(a, b) => new Date(a.created_at || a.date) - new Date(b.created_at || b.date)
				);
				break;
			case 'amount-desc':
				currentMonthExpenses.sort(
					(a, b) => parseFloat(b.expense_amount) - parseFloat(a.expense_amount)
				);
				break;
			case 'amount-asc':
				currentMonthExpenses.sort(
					(a, b) => parseFloat(a.expense_amount) - parseFloat(b.expense_amount)
				);
				break;
			case 'category-asc':
				currentMonthExpenses.sort((a, b) => a.expense_category.localeCompare(b.expense_category));
				break;
			case 'category-desc':
				currentMonthExpenses.sort((a, b) => b.expense_category.localeCompare(a.expense_category));
				break;
			default:
				currentMonthExpenses.sort(
					(a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)
				);
		}
	}

	function handleSort(method) {
		currentSortMethod = method;
		processAndSortExpenses();
		sortDropdownOpen = false;
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
			await loadBudgetData();
			const interval = setInterval(fetchDailyExpenses, 300000);
			return () => clearInterval(interval);
		} catch (error) {
			console.error('Session verification failed:', error);
			goto('/login');
		}
	});

	async function loadBudgetData() {
		isLoading = true;
		errorMessage = '';
		try {
			const [budgetRes, dailyRes, monthlyRes] = await Promise.all([
				fetch('api/budget-planner', { headers: await getAuthHeaders() }),
				fetch('/api/expenses/daily'),
				fetch('/api/expenses/monthly')
			]);

			if (!budgetRes.ok) throw new Error(await budgetRes.text());

			const data = await budgetRes.json();
			const { total: dailyTotal } = await dailyRes.json();
			const monthlyData = await monthlyRes.json();

			if (data && data.length > 0) {
				const budget = data[0];
				originalBudgetData = budget;
				total_budget = budget.total_budget;
				daily_limit = budget.daily_limit;
				daily_spent = dailyTotal || 0;
				categorySpending = monthlyData || {};

				const monthlyTotal = Object.values(monthlyData).reduce((sum, val) => sum + val, 0);
				totalSpent.set(monthlyTotal);

				category_budgets = [
					{ category: 'food_budget', amount: budget.food_budget, id: 1 },
					{ category: 'transportation_budget', amount: budget.transportation_budget, id: 2 },
					{ category: 'utilities_budget', amount: budget.utilities_budget, id: 3 },
					{ category: 'entertainment_budget', amount: budget.entertainment_budget, id: 4 },
					{ category: 'others_budget', amount: budget.others_budget, id: 5 },
					{ category: 'bills_budget', amount: budget.bills_budget, id: 6 }
				].filter((item) => item.amount > 0);
			}
		} catch (error) {
			console.error('Error loading data:', error);
			errorMessage = 'Failed to load data';
		} finally {
			isLoading = false;
		}
	}

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
			processExpenseData(expenses);
			processAndSortExpenses();
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
			await fetchMonthlyCategoryExpenses();
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
			await fetchMonthlyCategoryExpenses();
		} catch (error) {
			console.error('Error deleting expense:', error);
			errorMessage = 'Network error';
		}
	}

	async function fetchExpenses() {
		try {
			const response = await fetch('/api/expenses');
			if (!response.ok) throw new Error('Failed to fetch expenses');
			return await response.json();
		} catch (error) {
			console.error('Error fetching expenses:', error);
			return [];
		}
	}

	let chartLabels = $state([]);
	let chartData = $state([]);

	function processExpenseData(expenses) {
		const categoryMap = {};

		expenses.forEach((expense) => {
			const category = expense.expense_category;
			const amount = parseFloat(expense.expense_amount);

			if (!categoryMap[category]) {
				categoryMap[category] = 0;
			}
			categoryMap[category] += amount;
		});

		chartLabels = Object.keys(categoryMap);
		chartData = Object.values(categoryMap);
	}

	function reloadChart() {
		fetchExpenses().then((data) => {
			expenses = data;
			processExpenseData(expenses);
		});
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

		<a
			href="/budget-planner"
			class="my-auto flex h-[40%] flex-col items-center justify-center overflow-hidden rounded-xl bg-white shadow-xl"
			><div class="h-full w-full overflow-y-auto">
				<CategoryBudget
					{category_budgets}
					{categories}
					{categorySpending}
					{isEditMode}
					{removeBudget}
					{getCategoryColor}
					isOnPage={false}
				/>
			</div>
		</a>
	</div>

	<div class="mr-5 h-[95%] w-[40%] rounded-lg border border-gray-300 bg-white">
		<div class="h-[50%] w-full">
			<Chart
				title="Expense Breakdown"
				{chartLabels}
				{chartData}
				dataLabel="Amount Spent"
				chartType="bar"
				onReload={reloadChart}
				{expenses}
			/>
		</div>

		<!-- Expenses Display -->
		<div class="h-[50%] w-full bg-white">
			<div class="relative mt-3 flex h-full w-full flex-col items-center justify-center">
				{#if isLoading && expenses.length === 0}
					<div class="py-8 text-center">Loading expenses...</div>
				{:else}
					<div class="relative h-full w-full">
						<div class="mb-3 flex justify-end pr-5">
							<div class="relative">
								<button
									onclick={() => (sortDropdownOpen = !sortDropdownOpen)}
									class="mr-5 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
								>
									Sort Expenses
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>
								{#if sortDropdownOpen}
									<div
										class="ring-opacity-5 absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black"
									>
										<div class="py-1">
											<button
												onclick={() => handleSort('date-desc')}
												class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
											>
												Date (Newest First)
											</button>
											<button
												onclick={() => handleSort('date-asc')}
												class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
											>
												Date (Oldest First)
											</button>
											<button
												onclick={() => handleSort('amount-desc')}
												class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
											>
												Amount (High to Low)
											</button>
											<button
												onclick={() => handleSort('amount-asc')}
												class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
											>
												Amount (Low to High)
											</button>
											<button
												onclick={() => handleSort('category-asc')}
												class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
											>
												Category (A-Z)
											</button>
											<button
												onclick={() => handleSort('category-desc')}
												class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
											>
												Category (Z-A)
											</button>
										</div>
									</div>
								{/if}
							</div>
						</div>

						<ul
							bind:this={expensesList}
							class="my-3 flex max-h-65 w-full flex-col items-center overflow-y-auto pr-2"
						>
							{#each currentMonthExpenses as expense (expense.id)}
								<li
									class={`mb-2 flex w-[95%] items-center justify-between rounded-lg p-3 shadow
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
																: expense.expense_category === 'bills'
																	? 'bg-gradient-to-r from-green-400 to-green-700'
																	: 'bg-gray-50'
										}
                  `}
								>
									<div class="flex items-center space-x-3">
										<div class="h-3 w-3 rounded-full bg-white/50"></div>
										<div class="flex flex-col">
											<div class="flex items-center space-x-2">
												<span class="text-sm font-medium text-white">
													{expense.expense_category.charAt(0).toUpperCase() +
														expense.expense_category.slice(1)}
												</span>
												<span class="text-xs text-white/80">
													{new Date(expense.created_at || expense.date).toLocaleDateString(
														'en-US',
														{
															month: 'short',
															day: 'numeric'
														}
													)}
												</span>
											</div>
											<span class="text-xs text-white/70">{expense.expense_note}</span>
										</div>
									</div>
									<div class="flex items-center space-x-2">
										<span class="text-sm font-bold text-white">₱{expense.expense_amount}</span>
										<div class="flex space-x-1">
											{#if expense.expense_category !== 'bills'}
												<button
													aria-label="Edit"
													onclick={() => openEditModal(expense)}
													class="p-1 text-white transition-colors hover:text-gray-200"
													title="Edit"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="16"
														height="16"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round"
													>
														<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
														></path>
														<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
														></path>
													</svg>
												</button>
											{/if}

											{#if expense.expense_category !== 'bills'}
												<button
													aria-label="Delete"
													onclick={() => deleteExpense(expense.id)}
													class="p-1 text-white transition-colors hover:text-gray-200"
													title="Delete"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="16"
														height="16"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round"
													>
														<polyline points="3 6 5 6 21 6"></polyline>
														<path
															d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
														></path>
														<line x1="10" y1="11" x2="10" y2="17"></line>
														<line x1="14" y1="11" x2="14" y2="17"></line>
													</svg>
												</button>
											{/if}
										</div>
									</div>
								</li>
							{/each}
						</ul>
						<h1 class="text-center text-xl font-bold text-green-600">
							TOTAL MONEY SPENT THIS MONTH: ₱ {$totalSpent}
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
