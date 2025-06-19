<script>
	import { error } from '@sveltejs/kit';
	import SideNav from '../../components/Sidenav.svelte';
	import { fade, slide } from 'svelte/transition';
	import { onMount } from 'svelte';

	let budget_plan = $state([]);
	let errorMessage = $state('');
	let daily_limit = $state('');
	let daily_spent = $state('');
	let total_budget = $state('');
	let remaining_budget = $state('');
	let category_budgets = $state([]);
	let selected_category = $state('food_budget');
	let category_amount = $state(0);
	let has_data = $state(false); // Track if any data exists

	let categories = [
		{ name: 'food_budget', label: 'Food' },
		{ name: 'transportation_budget', label: 'Transportation' },
		{ name: 'utilities_budget', label: 'Utilities' },
		{ name: 'entertainment_budget', label: 'Entertainment' },
		{ name: 'other_budget', label: 'Other' }
	];

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
		if (category_amount <= 0) return;

		has_data = true;

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

			// await loadExpenses();
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

	async function setBudget() {
		errorMessage = '';

		try {
			const res = await fetch('api/budget-planner', {
				method: 'POST',
				headers: await getAuthHeaders(),
				body: JSON.stringify({
					total_budget,
					daily_limit,
					food_budget,
					transportation_budget,
					utilities_budget,
					entertainment_budget,
					other_budget
				})
			});

			if (!res.ok) {
				const err = await res.json();
				errorMessage = err.error || 'Failed to set budget';
				return;
			}

			total_budget = '';
			daily_limit = '';
			food_budget = '';
			transportation_budget = '';
			utilities_budget = '';
			entertainment_budget = '';
			other_budget = '';
			// await loadBudgetPlan();
		} catch (error) {
			console.error('Error adding expenses:', error);
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
						class="w-full rounded-lg border border-gray-800 bg-transparent p-2 text-center text-3xl font-bold text-gray-900 placeholder:text-3xl placeholder:font-bold"
						required
					/>
					<button
						onclick={setMonthlyBudget}
						aria-label="Add expense"
						class="ml-2 rounded-full bg-green-500 p-2 hover:bg-green-800"
					>
						➔
					</button>
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
						class="w-full rounded-lg border border-gray-800 bg-transparent p-2 text-center text-3xl font-bold text-gray-900 placeholder:text-3xl placeholder:font-bold"
						required
					/>
					<button
						onclick={setDailyLimit}
						aria-label="Add expense"
						class="ml-2 rounded-full bg-green-500 p-2 hover:bg-green-800"
					>
						➔
					</button>
				</div>
			</div>
		</div>

		<!-- Category Budget Section -->
		<div class="relative mx-auto my-2 h-[25%] w-[95%] rounded-2xl border border-gray-300 p-4">
			<select bind:value={selected_category} class="mb-2 w-full rounded-lg border p-2">
				{#each categories as category}
					<option value={category.name}>{category.label}</option>
				{/each}
			</select>

			<input
				type="number"
				placeholder="Amount"
				bind:value={category_amount}
				class="mb-2 w-full rounded-lg border p-2"
			/>

			<button
				onclick={addBudget}
				class="absolute right-2 bottom-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
			>
				Add Budget
			</button>
		</div>

		<!-- Budget List or Calendar -->
		<div
			class="mx-auto my-5 h-[50%] w-[95%] overflow-y-auto rounded-2xl border border-gray-300 p-4"
		>
			<!-- Calendar Section -->
			<div class="calendar-container">
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
			</div>
		</div>
	</div>

	<!-- Budget Summary Section - Optimized to prevent overflow -->
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
									<span class="font-medium">
										₱{item.amount.toLocaleString()} remaining (of ₱{item.amount.toLocaleString()})
									</span>
								</div>
								<div class="h-2 w-full rounded-full bg-gray-200">
									<div class="h-2 rounded-full bg-green-500" style="width: 100%"></div>
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
					<button class="rounded-lg bg-gray-200 px-3 py-1.5 text-sm hover:bg-gray-300">Edit</button>
					<button
						onclick={setBudget}
						class="rounded-lg bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
					>
						Set Budget
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
