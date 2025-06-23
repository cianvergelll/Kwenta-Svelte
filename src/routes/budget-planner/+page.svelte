<script>
	import { error } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import SideNav from '../../components/Sidenav.svelte';
	import { fade, slide } from 'svelte/transition';
	import { onMount } from 'svelte';

	let budget_plan = $state([]);
	let errorMessage = $state('');
	let daily_limit = $state('');
	let daily_spent = $state('');
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

	let categories = [
		{ name: 'food_budget', label: 'Food' },
		{ name: 'transportation_budget', label: 'Transportation' },
		{ name: 'utilities_budget', label: 'Utilities' },
		{ name: 'entertainment_budget', label: 'Entertainment' },
		{ name: 'others_budget', label: 'Other' }
	];

	function calculateRemainingBudget() {
		remaining_budget = total_budget;
	}

	function setMonthlyBudget() {
		if (total_budget > 0) has_data = true;
	}

	function setDailyLimit() {
		if (daily_limit > 0) has_data = true;
	}

	let days_remaining_in_month = $state(0);
	let currentDate = $state(new Date());
	let selectedDate = $state(null);
	let showMonthPicker = $state(false);
	let showYearPicker = $state(false);

	const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i);
	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	function addBudget() {
		if (category_amount <= 0) {
			errorMessage = 'Please enter a valid amount';
			return;
		}

		// Check if category already has a budget
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

	function getDaysInMonth(year, month) {
		return new Date(year, month + 1, 0).getDate();
	}

	function getFirstDayOfMonth(year, month) {
		return new Date(year, month, 1).getDay();
	}

	function prevMonth() {
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
	}

	function nextMonth() {
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
	}

	function selectDate(date) {
		selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
	}

	function selectMonth(monthIndex) {
		currentDate = new Date(currentDate.getFullYear(), monthIndex, 1);
		showMonthPicker = false;
	}

	function selectYear(year) {
		currentDate = new Date(year, currentDate.getMonth(), 1);
		showYearPicker = false;
	}

	function toggleMonthPicker() {
		showMonthPicker = !showMonthPicker;
		showYearPicker = false;
	}

	function toggleYearPicker() {
		showYearPicker = !showYearPicker;
		showMonthPicker = false;
	}

	function goToToday() {
		currentDate = new Date();
		selectedDate = new Date();
		showMonthPicker = false;
		showYearPicker = false;
	}

	function toggleEditMode() {
		isEditMode = !isEditMode;
		if (!isEditMode && hasExistingBudget) {
			// Reset to original values when canceling edit
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
				{ category: 'others_budget', amount: originalBudgetData.others_budget, id: 5 }
			].filter((item) => item.amount > 0);
		} else {
			// Clear input fields when entering edit mode
			category_amount = 0;
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
			others_budget: 0
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

			// Update our original data and exit edit mode
			originalBudgetData = budgetData;
			hasExistingBudget = true;
			isEditMode = false;
		} catch (error) {
			console.error('Error updating budget:', error);
			errorMessage = 'Failed to update budget';
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

			await loadBudgetData();
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

	async function loadBudgetData() {
		isLoading = true;
		errorMessage = '';
		try {
			const res = await fetch('api/budget-planner', {
				headers: await getAuthHeaders()
			});

			if (!res.ok) {
				const err = await res.json();
				errorMessage = err.error || 'Failed to load budget';
				return;
			}

			const data = await res.json();

			if (data && data.length > 0) {
				const budget = data[0];
				originalBudgetData = budget;

				total_budget = budget.total_budget;
				daily_limit = budget.daily_limit;

				category_budgets = [
					{ category: 'food_budget', amount: budget.food_budget, id: 1 },
					{ category: 'transportation_budget', amount: budget.transportation_budget, id: 2 },
					{ category: 'utilities_budget', amount: budget.utilities_budget, id: 3 },
					{ category: 'entertainment_budget', amount: budget.entertainment_budget, id: 4 },
					{ category: 'others_budget', amount: budget.others_budget, id: 5 }
				].filter((item) => item.amount > 0);

				hasExistingBudget = true;
				has_data = true;
			}
		} catch (error) {
			console.error('Error loading budget:', error);
			errorMessage = 'Network error';
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
			others_budget: 0
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
		} catch (error) {
			console.error('Error adding expenses:', error);
			errorMessage = 'Failed to save budget';
		}
	}

	// Helper function to get gradient class based on category
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
			default:
				return 'bg-gray-50';
		}
	}
</script>

<div class="flex h-screen w-screen items-center justify-start bg-gray-100">
	<!-- Side Navigation -->
	<div class="ml-5 flex h-[95%] w-1/5 flex-col rounded-xl shadow-lg">
		<SideNav />
	</div>

	<!-- Main Budget Content -->
	<div class="mx-auto flex h-[95%] w-[35%] flex-col rounded-lg border border-gray-300 bg-white p-4">
		<!-- Budget Input Section -->
		<div class="mb-4 flex flex-col space-y-4 border-b border-gray-300">
			<!-- Monthly Budget Input -->
			<div class="flex flex-col">
				<label class="text-m mb-2 block pl-[5%]" for="total-budget">
					Enter your monthly budget
				</label>
				<div class="flex items-center">
					<input
						id="total-budget"
						type="number"
						placeholder="₱ 00.00"
						bind:value={total_budget}
						class="w-full rounded-lg border border-gray-800 bg-transparent p-2 text-center text-3xl font-bold text-gray-900 placeholder:text-3xl placeholder:font-bold disabled:bg-gray-100 disabled:opacity-70"
						required
						disabled={hasExistingBudget && !isEditMode}
					/>
					{#if (!hasExistingBudget || isEditMode) && total_budget > 0}
						<button
							onclick={setMonthlyBudget}
							aria-label="Add expense"
							class="ml-2 rounded-full bg-green-500 p-2 hover:bg-green-800"
						>
							➔
						</button>
					{/if}
				</div>
			</div>

			<!-- Daily Spending Limit Input -->
			<div class="flex flex-col">
				<label class="text-m mb-2 block pl-[5%]" for="daily-limit">
					Enter daily spending limit
				</label>
				<div class="flex items-center">
					<input
						id="daily-limit"
						type="number"
						placeholder="₱ 00.00"
						bind:value={daily_limit}
						class="w-full rounded-lg border border-gray-800 bg-transparent p-2 text-center text-3xl font-bold text-gray-900 placeholder:text-3xl placeholder:font-bold disabled:bg-gray-100 disabled:opacity-70"
						required
						disabled={hasExistingBudget && !isEditMode}
					/>
					{#if (!hasExistingBudget || isEditMode) && daily_limit > 0}
						<button
							onclick={setDailyLimit}
							aria-label="Add expense"
							class="ml-2 rounded-full bg-green-500 p-2 hover:bg-green-800"
						>
							➔
						</button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Category Budget Section -->
		{#if hasExistingBudget || isEditMode}
			<div
				class="relative mx-auto my-2 h-[25%] w-[95%] rounded-2xl border border-gray-300 p-4 {hasExistingBudget &&
				!isEditMode
					? 'opacity-70'
					: ''}"
			>
				<select
					bind:value={selected_category}
					class="mb-2 w-full rounded-lg border p-2 disabled:bg-gray-100 disabled:opacity-70"
					disabled={hasExistingBudget && !isEditMode}
				>
					{#each categories as category}
						<option value={category.name}>{category.label}</option>
					{/each}
				</select>

				<input
					type="number"
					placeholder="Enter amount"
					bind:value={category_amount}
					class="mb-2 w-full rounded-lg border p-2 disabled:bg-gray-100 disabled:opacity-70"
					disabled={hasExistingBudget && !isEditMode}
				/>

				<button
					onclick={addBudget}
					class="absolute right-2 bottom-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
					disabled={hasExistingBudget && !isEditMode}
				>
					Add Budget
				</button>
			</div>
		{/if}

		<!-- Error Message Display -->
		{#if errorMessage}
			<div class="mx-auto mb-4 w-[95%] rounded-lg bg-red-100 p-3 text-center text-red-700">
				{errorMessage}
			</div>
		{/if}

		<!-- Budget List or Calendar -->
		<div
			class="mx-auto my-5 h-[50%] w-[95%] overflow-y-auto rounded-2xl border border-gray-300 p-4"
		>
			<!-- Calendar Section -->
			<div class="calendar-container">
				<div class="mt-4 flex items-center justify-center space-x-4">
					<div class="flex items-center space-x-1">
						<div class="h-3 w-3 rounded-full bg-green-500"></div>
						<span class="text-xs">On Track</span>
					</div>
					<div class="flex items-center space-x-1">
						<div class="h-3 w-3 rounded-full bg-yellow-500"></div>
						<span class="text-xs">Caution</span>
					</div>
					<div class="flex items-center space-x-1">
						<div class="h-3 w-3 rounded-full bg-red-500"></div>
						<span class="text-xs">Overspending</span>
					</div>
				</div>
				<div class="calendar-header mb-4 flex items-center justify-between">
					<button onclick={prevMonth} class="rounded p-1 hover:bg-gray-200"> &lt; </button>

					<div class="flex items-center space-x-2">
						<div class="relative">
							<button
								onclick={toggleMonthPicker}
								class="rounded px-2 py-1 font-medium hover:bg-gray-200"
							>
								{months[currentDate.getMonth()]}
							</button>
							{#if showMonthPicker}
								<div
									class="absolute left-0 z-10 mt-1 grid w-32 grid-cols-3 gap-1 rounded-lg border border-gray-300 bg-white p-2 shadow-lg"
								>
									{#each months as month, index}
										<button
											onclick={() => selectMonth(index)}
											class="rounded p-1 text-xs hover:bg-gray-100 {currentDate.getMonth() === index
												? 'bg-blue-100 font-medium'
												: ''}"
										>
											{month.slice(0, 3)}
										</button>
									{/each}
								</div>
							{/if}
						</div>

						<div class="relative">
							<button
								onclick={toggleYearPicker}
								class="rounded px-2 py-1 font-medium hover:bg-gray-200"
							>
								{currentDate.getFullYear()}
							</button>
							{#if showYearPicker}
								<div
									class="absolute left-0 z-10 mt-1 max-h-40 w-24 overflow-y-auto rounded-lg border border-gray-300 bg-white p-2 shadow-lg"
								>
									{#each years as year}
										<button
											onclick={() => selectYear(year)}
											class="w-full rounded px-2 py-1 text-left text-sm hover:bg-gray-100 {currentDate.getFullYear() ===
											year
												? 'bg-blue-100 font-medium'
												: ''}"
										>
											{year}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					</div>

					<button onclick={nextMonth} class="rounded p-1 hover:bg-gray-200"> &gt; </button>
				</div>

				<button
					onclick={goToToday}
					class="mb-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
				>
					Today
				</button>

				<div class="calendar-grid grid grid-cols-7 gap-1">
					{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
						<div class="text-center text-sm font-medium text-gray-500">{day}</div>
					{/each}

					{#each Array(getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth())).fill(0) as _, i}
						<div class="h-8"></div>
					{/each}

					{#each Array(getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())).fill(0) as _, i}
						{@const date = i + 1}
						{@const isSelected =
							selectedDate &&
							selectedDate.getDate() === date &&
							selectedDate.getMonth() === currentDate.getMonth() &&
							selectedDate.getFullYear() === currentDate.getFullYear()}
						{@const isToday =
							new Date().getDate() === date &&
							new Date().getMonth() === currentDate.getMonth() &&
							new Date().getFullYear() === currentDate.getFullYear()}
						<button
							onclick={() => selectDate(date)}
							class="h-8 w-8 rounded-full text-center hover:bg-blue-100 {isSelected
								? 'bg-blue-500 text-white'
								: ''} {isToday ? 'border border-blue-500' : ''}"
						>
							{date}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Budget Summary Section -->
	<div class="mr-5 flex h-[95%] w-[40%] flex-col rounded-lg border border-gray-300 bg-white p-4">
		<div class="flex h-full flex-col">
			<h2 class="mb-4 text-xl font-bold">Budget Summary</h2>

			<!-- Fixed Top Section (Outside Scroll) -->
			<div class="sticky top-0 z-10 bg-white pb-4">
				{#if has_data}
					<!-- Monthly Budget Summary -->
					<div transition:slide class="mb-4 rounded-lg bg-gray-50 p-4">
						<div class="mb-1 flex items-center justify-between">
							<span class="font-medium">Total Monthly Budget</span>
							<span class="font-medium">₱{total_budget.toLocaleString()}</span>
						</div>
						<div class="h-2.5 w-full rounded-full bg-gray-200">
							<div class="h-2.5 rounded-full bg-blue-600" style="width: 100%"></div>
						</div>
					</div>

					<!-- Daily Spending Limit Summary -->
					<div transition:slide class="mb-4 rounded-lg bg-gray-50 p-4">
						<div class="mb-1 flex items-center justify-between">
							<span class="font-medium">Daily Spending Limit</span>
							<span class="font-medium">₱{daily_limit.toLocaleString()}</span>
						</div>
						<div class="h-2.5 w-full rounded-full bg-gray-200">
							<div
								class="h-2.5 rounded-full bg-green-600"
								style="width: {((daily_limit - daily_spent) / daily_limit) * 100}%"
							></div>
						</div>
					</div>
				{:else}
					<div class="flex h-40 items-center justify-center text-gray-400">
						Start adding your budget plan
					</div>
				{/if}
			</div>

			<!-- Scrollable Content Area -->
			<div class="flex-1 overflow-y-auto">
				{#if has_data}
					<!-- Compact Category Breakdown -->
					<div class="space-y-3">
						{#each category_budgets as item (item.id)}
							<div transition:fade class="rounded-lg border border-gray-200 p-3">
								<div class="mb-1 flex items-center justify-between text-sm">
									<span>{categories.find((c) => c.name === item.category)?.label}</span>
									<div class="flex items-center">
										<span class="mr-2 font-medium">
											₱{item.amount.toLocaleString()} remaining (of ₱{item.amount.toLocaleString()})
										</span>
										{#if isEditMode}
											<button
												aria-label="Remove budget"
												onclick={() => removeBudget(item.id)}
												class="text-red-500 hover:text-red-700"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-5 w-5"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										{/if}
									</div>
								</div>
								<div class="h-2 w-full rounded-full bg-gray-200">
									<div
										class="h-2 rounded-full {getCategoryColor(item.category)}"
										style="width: 100%"
									></div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Fixed Bottom Section (Outside Scroll) -->
			<div class="sticky bottom-0 bg-white pt-4">
				{#if has_data}
					<!-- Total Remaining -->
					<div transition:slide class="mb-4 rounded-lg bg-gray-50 p-4">
						<div class="flex items-center justify-between">
							<span class="font-semibold">Total Remaining</span>
							<span class="font-semibold">₱{remaining_budget.toLocaleString()}</span>
						</div>
						<div class="mt-1 flex items-center justify-between text-xs">
							<span class="text-gray-600">Daily average available:</span>
							<span class="font-medium"
								>₱{(remaining_budget / days_remaining_in_month).toFixed(2)}</span
							>
						</div>
					</div>
				{/if}

				<!-- Fixed Footer Buttons -->
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
