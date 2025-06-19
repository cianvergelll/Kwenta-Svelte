<script>
	import SideNav from '../../components/Sidenav.svelte';

	let total_budget = $state('');
	let category_budgets = $state([]);
	let selected_category = $state('food_budget');
	let category_amount = $state(0);

	let categories = [
		{ name: 'food_budget', label: 'Food' },
		{ name: 'transportation_budget', label: 'Transportation' },
		{ name: 'utilities_budget', label: 'Utilities' },
		{ name: 'entertainment_budget', label: 'Entertainment' },
		{ name: 'other_budget', label: 'Other' }
	];

	// Calendar variables
	let currentDate = $state(new Date());
	let selectedDate = $state(null);
	let showMonthPicker = $state(false);
	let showYearPicker = $state(false);

	// Generate years for dropdown (10 years back and 10 years forward)
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

	const inputStyle = 'w-[90%] py-2 rounded-lg pl-4 mb-2 placeholder:text-gray-400';
	const buttonStyle = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200';

	function addBudget() {
		if (category_amount <= 0) return;

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
	}

	// Calendar functions
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
</script>

<div class="flex h-screen w-screen items-center justify-start bg-gray-100">
	<div class="ml-5 flex h-[95%] w-1/5 flex-col rounded-xl shadow-lg">
		<SideNav />
	</div>

	<div class="mx-auto flex h-[95%] w-[35%] flex-col rounded-lg border border-gray-300 bg-white p-4">
		<div class="mb-4">
			<label class="text-m mb-2 block pl-[5%]" for="total-budget">
				Enter your monthly budget
			</label>
			<div class="flex items-center">
				<input
					id="total-budget"
					type="number"
					placeholder="₱ 00.00"
					bind:value={total_budget}
					class={`${inputStyle} border border-gray-800 bg-transparent text-center text-3xl font-bold text-gray-900 placeholder:text-3xl placeholder:font-bold`}
					required
				/>
				<button
					aria-label="Add expense"
					class="ml-2 rounded-full bg-green-500 p-2 hover:bg-green-800"
				>
					➔
				</button>
			</div>
		</div>

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
				class="absolute right-2 bottom-2 ${buttonStyle} bg-blue-500 text-white hover:bg-blue-600"
			>
				Add Budget
			</button>
		</div>

		<div
			class="mx-auto my-5 h-[50%] w-[95%] overflow-y-auto rounded-2xl border border-gray-300 p-4"
		>
			{#if category_budgets.length === 0}
				<!-- Enhanced Calendar Section -->
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
												class="rounded p-1 text-xs hover:bg-gray-100 {currentDate.getMonth() ===
												index
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
								class="h-8 w-8 rounded-full text-center hover:bg-blue-100
									{isSelected ? 'bg-blue-500 text-white' : ''}
									{isToday ? 'border border-blue-500' : ''}"
							>
								{date}
							</button>
						{/each}
					</div>

					<!-- Budget Status Legend -->
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
			{:else}
				<ul class="space-y-2">
					{#each category_budgets as item (item.id)}
						<li class="flex items-center justify-between border-b p-2">
							<div>
								<span class="font-medium">
									{categories.find((c) => c.name === item.category)?.label}:
								</span>
								<span>₱{item.amount.toLocaleString()}</span>
							</div>
							<button onclick={() => removeBudget(item.id)} class="text-red-500 hover:text-red-700">
								×
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>

	<div class="mr-5 h-[95%] w-[40%] rounded-lg border border-gray-300 bg-white p-4">
		<div class="mx-auto w-[95%] space-y-4">
			<h2 class="mb-6 text-xl font-bold">Budget Summary</h2>

			<div class="mx-auto mb-8 w-[95%] rounded-lg bg-gray-50 p-4">
				<div class="mb-1 flex items-center justify-between">
					<span class="font-medium">Total Budget</span>
					<span class="font-medium">₱10,000</span>
				</div>
				<div class="h-2.5 w-full rounded-full bg-gray-200">
					<div class="h-2.5 rounded-full bg-blue-600" style="width: 100%"></div>
				</div>
			</div>

			<div class="mx-auto w-[95%] space-y-4">
				<div class="rounded-lg border border-gray-200 p-3">
					<div class="mb-1 flex items-center justify-between">
						<span>Food</span>
						<span class="font-medium">₱2,500 remaining (of ₱4,000)</span>
					</div>
					<div class="h-2.5 w-full rounded-full bg-gray-200">
						<div class="h-2.5 rounded-full bg-green-500" style="width: 62.5%"></div>
					</div>
				</div>

				<div class="rounded-lg border border-gray-200 p-3">
					<div class="mb-1 flex items-center justify-between">
						<span>Transportation</span>
						<span class="font-medium">₱1,200 remaining (of ₱2,000)</span>
					</div>
					<div class="h-2.5 w-full rounded-full bg-gray-200">
						<div class="h-2.5 rounded-full bg-yellow-500" style="width: 60%"></div>
					</div>
				</div>

				<div class="rounded-lg border border-gray-200 p-3">
					<div class="mb-1 flex items-center justify-between">
						<span>Utilities</span>
						<span class="font-medium">₱3,000 remaining (of ₱5,000)</span>
					</div>
					<div class="h-2.5 w-full rounded-full bg-gray-200">
						<div class="h-2.5 rounded-full bg-red-500" style="width: 60%"></div>
					</div>
				</div>

				<div class="rounded-lg border border-gray-200 p-3">
					<div class="mb-1 flex items-center justify-between">
						<span>Entertainment</span>
						<span class="font-medium">₱1,500 remaining (of ₱3,000)</span>
					</div>
					<div class="h-2.5 w-full rounded-full bg-gray-200">
						<div class="h-2.5 rounded-full bg-purple-500" style="width: 50%"></div>
					</div>
				</div>

				<div class="rounded-lg border border-gray-200 p-3">
					<div class="mb-1 flex items-center justify-between">
						<span>Other</span>
						<span class="font-medium">₱1,800 remaining (of ₱2,000)</span>
					</div>
					<div class="h-2.5 w-full rounded-full bg-gray-200">
						<div class="h-2.5 rounded-full bg-pink-500" style="width: 90%"></div>
					</div>
				</div>
			</div>

			<div class="mx-auto mt-8 w-[95%] rounded-lg bg-gray-50 p-4">
				<div class="flex items-center justify-between">
					<span class="font-semibold">Total Remaining</span>
					<span class="font-semibold">₱10,000</span>
				</div>
			</div>

			<!-- Moved buttons here -->
			<div class="flex justify-end space-x-4 pt-4">
				<button class={`${buttonStyle} bg-gray-200 hover:bg-gray-300`}> Edit </button>
				<button class={`${buttonStyle} bg-blue-500 text-white hover:bg-blue-600`}>
					Set Budget
				</button>
			</div>
		</div>
	</div>
</div>
