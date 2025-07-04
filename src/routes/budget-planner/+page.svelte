<script>
	import { error } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import SideNav from '../../components/Sidenav.svelte';
	import { fade, slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { totalSpent } from '$lib/stores/totalSpent';
	import CalendarTracker from '../../components/CalendarTracker.svelte';
	import CategoryBudget from '../../components/CategoryBudget.svelte';

	// State variables
	let budget_plan = $state([]);
	let errorMessage = $state('');
	let daily_limit = $state(0);
	let daily_spent = $state(0);
	let total_budget = $state('');
	let remaining_budget = $state(0);
	let category_budgets = $state([]);
	let selected_category = $state('food_budget');
	let category_amount = $state('');
	let has_data = $state(false);
	let isLoading = $state(false);
	let hasExistingBudget = $state(false);
	let isEditMode = $state(false);
	let originalBudgetData = $state(null);
	let categorySpending = $state({});
	let isOnPage = $state(true);
	let currentDate = $state(new Date());

	const categories = [
		{ name: 'food_budget', label: 'Food' },
		{ name: 'transportation_budget', label: 'Transportation' },
		{ name: 'utilities_budget', label: 'Utilities' },
		{ name: 'entertainment_budget', label: 'Entertainment' },
		{ name: 'others_budget', label: 'Others' },
		{ name: 'bills_budget', label: 'Bills' }
	];

	// Helper functions
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

	async function getAuthHeaders() {
		const token = localStorage.getItem('sessionToken');
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		};
	}

	// Data fetching functions
	async function fetchDailyStatus(month, year) {
		// Implementation depends on your API
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

	// Budget functions
	function setMonthlyBudget() {
		if (total_budget > 0) has_data = true;
	}

	function setDailyLimit() {
		if (daily_limit > 0) has_data = true;
	}

	function addBudget() {
		if (category_amount <= 0) {
			errorMessage = 'Please enter a valid amount';
			return;
		}

		if (category_budgets.some((item) => item.category === selected_category)) {
			errorMessage = `You already have a budget for ${categories.find((c) => c.name === selected_category).label}`;
			return;
		}

		has_data = true;
		errorMessage = '';

		category_budgets = [
			...category_budgets,
			{
				category: selected_category,
				amount: category_amount,
				id: Date.now()
			}
		];

		category_amount = 0;
	}

	function removeBudget(id) {
		category_budgets = category_budgets.filter((item) => item.id !== id);
		if (category_budgets.length === 0 && !total_budget && !daily_limit) {
			has_data = false;
		}
	}

	function toggleEditMode() {
		isEditMode = !isEditMode;
		if (!isEditMode && hasExistingBudget) {
			total_budget = originalBudgetData.total_budget;
			daily_limit = originalBudgetData.daily_limit;
			category_budgets = [
				{ category: 'food_budget', amount: originalBudgetData.food_budget, id: 1 },
				{
					category: 'transportation_budget',
					amount: originalBudgetData.transportation_budget,
					id: 2
				},
				{ category: 'utilities_budget', amount: originalBudgetData.utilities_budget, id: 3 },
				{
					category: 'entertainment_budget',
					amount: originalBudgetData.entertainment_budget,
					id: 4
				},
				{ category: 'others_budget', amount: originalBudgetData.others_budget, id: 5 },
				{
					category: 'bills_budget',
					amount: originalBudgetData.bills_budget,
					id: 6
				}
			].filter((item) => item.amount > 0);
		}
	}

	let calendarRef = $state(null);

	async function updateDailyStatus() {
		if (daily_limit === undefined || daily_spent === undefined) return;

		const today = new Date().toISOString().split('T')[0];
		const amount_spent = daily_spent;
		const dailyLimit = daily_limit;

		try {
			const res = await fetch('/api/daily-status', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('sessionToken')}`
				},
				body: JSON.stringify({
					date: today,
					amount_spent,
					daily_limit: dailyLimit
				})
			});

			if (res.ok) {
				// Refresh the calendar data after update
				calendarRef?.refreshData();
			}
		} catch (err) {
			console.error('Error updating daily status:', err);
		}
	}

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

				hasExistingBudget = true;
				has_data = true;
			}
		} catch (error) {
			console.error('Error loading data:', error);
			errorMessage = 'Failed to load data';
		} finally {
			isLoading = false;
		}
	}

	async function setBudget() {
		errorMessage = '';

		const budgetData = {
			total_budget: Number(total_budget) || 0,
			daily_limit: Number(daily_limit) || 0,
			food_budget: 0,
			transportation_budget: 0,
			utilities_budget: 0,
			entertainment_budget: 0,
			others_budget: 0,
			bills_budget: 0
		};

		category_budgets.forEach((item) => {
			budgetData[item.category] = Number(item.amount) || 0;
		});

		try {
			const res = await fetch('api/budget-planner', {
				method: hasExistingBudget ? 'PUT' : 'POST',
				headers: await getAuthHeaders(),
				body: JSON.stringify(budgetData)
			});

			if (!res.ok) {
				const err = await res.json();
				errorMessage = err.error || 'Failed to set budget';
				return;
			}

			originalBudgetData = budgetData;
			hasExistingBudget = true;
			isEditMode = false;
			await loadBudgetData();
		} catch (error) {
			console.error('Error adding expenses:', error);
			errorMessage = 'Failed to save budget';
		}
	}

	async function updateBudget() {
		errorMessage = '';

		const budgetData = {
			total_budget: Number(total_budget) || 0,
			daily_limit: Number(daily_limit) || 0,
			food_budget: 0,
			transportation_budget: 0,
			utilities_budget: 0,
			entertainment_budget: 0,
			others_budget: 0,
			bills_budget: 0
		};

		category_budgets.forEach((item) => {
			budgetData[item.category] = Number(item.amount) || 0;
		});

		try {
			const res = await fetch('api/budget-planner', {
				method: 'PUT',
				headers: await getAuthHeaders(),
				body: JSON.stringify(budgetData)
			});

			if (!res.ok) {
				const err = await res.json();
				errorMessage = err.error || 'Failed to update budget';
				return;
			}

			originalBudgetData = budgetData;
			hasExistingBudget = true;
			isEditMode = false;

			await loadBudgetData();
		} catch (error) {
			console.error('Error updating budget:', error);
			errorMessage = 'Failed to update budget';
		}
	}

	// Lifecycle
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

			await loadBudgetData();
			const interval = setInterval(fetchDailyExpenses, 300000);
			await updateDailyStatus();
			return () => clearInterval(interval);
		} catch (error) {
			console.error('Session verification failed:', error);
			goto('/login');
		}
	});

	// Effects
	$effect(() => {
		if (isOnPage && daily_spent > 0 && daily_limit !== undefined) {
			updateDailyStatus();
		}
	});
</script>

<div class="flex h-screen w-screen items-center justify-start bg-gray-100">
	<!-- Side Navigation -->
	<div class="ml-5 flex h-[95%] w-1/5 flex-col rounded-xl shadow-lg">
		<SideNav />
	</div>

	<!-- Main Budget Content -->
	<div
		class="mx-auto flex h-[95%] w-[35%] flex-col overflow-hidden rounded-lg border border-gray-300 bg-white p-4"
	>
		<!-- Budget Input Section -->
		<div class="mb-4 flex flex-col space-y-4 border-b border-gray-300 pb-4">
			<!-- Monthly Budget Input -->
			<div class="flex flex-col">
				<label class="mb-1 pl-1 text-sm text-gray-600" for="total-budget">
					Enter your monthly budget
				</label>
				<div class="flex items-center gap-2">
					<input
						id="total-budget"
						type="number"
						placeholder="₱ 00.00"
						bind:value={total_budget}
						class="flex-1 rounded-lg border border-gray-300 bg-transparent p-3 text-center text-2xl font-bold text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:opacity-70"
						required
						disabled={hasExistingBudget && !isEditMode}
					/>
					{#if (!hasExistingBudget || isEditMode) && total_budget > 0}
						<button
							onclick={setMonthlyBudget}
							aria-label="Add expense"
							class="rounded-lg bg-green-500 p-3 transition-colors hover:bg-green-600"
						>
							<span class="text-white">➔</span>
						</button>
					{/if}
				</div>
			</div>

			<!-- Daily Spending Limit Input -->
			<div class="flex flex-col">
				<label class="mb-1 pl-1 text-sm text-gray-600" for="daily-limit">
					Enter daily spending limit
				</label>
				<div class="flex items-center gap-2">
					<input
						id="daily-limit"
						type="number"
						placeholder="₱ 00.00"
						bind:value={daily_limit}
						class="flex-1 rounded-lg border border-gray-300 bg-transparent p-3 text-center text-2xl font-bold text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:opacity-70"
						required
						disabled={hasExistingBudget && !isEditMode}
					/>
					{#if (!hasExistingBudget || isEditMode) && daily_limit > 0}
						<button
							onclick={setDailyLimit}
							aria-label="Add expense"
							class="rounded-lg bg-green-500 p-3 transition-colors hover:bg-green-600"
						>
							<span class="text-white">➔</span>
						</button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Category Budget Section -->
		{#if hasExistingBudget || isEditMode}
			<div
				class="relative mx-auto mt-2 w-full rounded-2xl border border-gray-300 p-4 {hasExistingBudget &&
				!isEditMode
					? 'opacity-70'
					: ''}"
			>
				<select
					bind:value={selected_category}
					class="mb-3 w-full rounded-lg border border-gray-300 p-2 disabled:bg-gray-100 disabled:opacity-70"
					disabled={hasExistingBudget && !isEditMode}
				>
					{#each categories as category}
						<option value={category.name}>{category.label}</option>
					{/each}
				</select>
				<div class="flex gap-2">
					<input
						type="number"
						placeholder="Enter amount"
						bind:value={category_amount}
						class="flex-1 rounded-lg border border-gray-300 p-2 disabled:bg-gray-100 disabled:opacity-70"
						disabled={hasExistingBudget && !isEditMode}
					/>
					<button
						onclick={addBudget}
						class="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
						disabled={hasExistingBudget && !isEditMode}
					>
						Add Budget
					</button>
				</div>
			</div>
		{/if}

		<!-- Error Message Display -->
		{#if errorMessage}
			<div class="mx-auto my-3 w-full rounded-lg bg-red-100 p-3 text-center text-red-700">
				{errorMessage}
			</div>
		{/if}

		<!-- Calendar Container - Adjusted for proper sizing -->
		<div class="mt-3 min-h-0 flex-1">
			<!-- flex-1 min-h-0 allows proper scrolling -->
			<div class="h-full overflow-y-auto rounded-2xl border border-gray-300 p-3">
				<CalendarTracker bind:this={calendarRef} />
			</div>
		</div>
	</div>

	<!-- Budget Summary Section -->
	<div class="mr-5 flex h-[95%] w-[40%] flex-col rounded-lg border border-gray-300 bg-white p-4">
		<div class="flex h-full flex-col">
			<h2 class="mb-4 text-xl font-bold">Budget Summary</h2>

			<div class="sticky top-0 z-10 bg-white pb-4">
				{#if has_data}
					<!-- Monthly Budget Summary -->
					<div transition:slide class="mb-4 rounded-lg bg-gray-50 p-4">
						<div class="mb-1 flex items-center justify-between">
							<span class="font-medium">Monthly Budget Tracker</span>
							<span class="font-medium">
								₱{(total_budget - $totalSpent).toLocaleString()}
								<span class="text-sm text-gray-500">
									({Math.min(100, Math.round(100 - ($totalSpent / total_budget) * 100))}% Left)
								</span>
							</span>
						</div>
						<div class="h-2.5 w-full rounded-full bg-gray-200">
							<div
								class="h-2.5 rounded-full bg-blue-600"
								style={`width: ${Math.min(100, 100 - ($totalSpent / total_budget) * 100)}%`}
							></div>
						</div>
					</div>

					<div transition:slide class="mb-4 rounded-lg bg-gray-50 p-4">
						<div class="mb-1 flex items-center justify-between">
							<span class="font-medium">Daily Spending Tracker</span>
							<span class="font-medium">
								₱{(daily_limit - daily_spent).toLocaleString()}
								<span class="text-sm text-gray-500">
									({Math.max(0, Math.round(100 - (daily_spent / daily_limit) * 100))}% Left)
								</span>
							</span>
						</div>
						<div class="h-2.5 w-full rounded-full bg-gray-200">
							<div
								class="h-2.5 rounded-full bg-green-600"
								style={`width: ${Math.max(0, 100 - (daily_spent / daily_limit) * 100)}%`}
							></div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Scrollable Content Area -->
			<div class="flex-1 overflow-y-auto">
				<CategoryBudget
					{category_budgets}
					{categories}
					{categorySpending}
					{isEditMode}
					{removeBudget}
					{getCategoryColor}
					isOnPage={true}
				/>
			</div>

			<div class="sticky bottom-0 bg-white pt-4">
				{#if has_data}
					<!-- Total Remaining -->
					<div transition:slide class="mb-4 rounded-lg bg-gray-50 p-4">
						<div class="flex items-center justify-between">
							<span class="font-semibold">Monthly Budget</span>
							<span class="font-semibold">₱{Number(total_budget).toLocaleString('en-US')}.00</span>
						</div>
						<div class="mt-1 flex items-center justify-between text-xs">
							<span class="text-gray-600">Daily Spending Limit</span>
							<span class="font-medium">₱{Number(daily_limit).toLocaleString('en-US')}.00</span>
						</div>
					</div>
				{/if}

				<div class="flex justify-end space-x-3 pt-4">
					{#if hasExistingBudget}
						<button
							onclick={toggleEditMode}
							class="rounded-lg bg-gray-200 px-3 py-1.5 text-sm hover:bg-gray-300"
						>
							{#if isEditMode}
								Cancel
							{:else}
								Edit
							{/if}
						</button>
					{/if}
					<button
						onclick={setBudget}
						class="rounded-lg bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600 disabled:bg-blue-300"
						disabled={!has_data || (hasExistingBudget && !isEditMode)}
					>
						{#if hasExistingBudget}
							Update Budget
						{:else}
							Set Budget
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
