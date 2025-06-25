<script>
	import { onMount } from 'svelte';

	let days_remaining_in_month = $state(0);
	let currentDate = $state(new Date());
	let selectedDate = $state(null);
	let showMonthPicker = $state(false);
	let showYearPicker = $state(false);
	let dailyStatuses = $state({});

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

	// Fetch status when month changes
	$effect(() => {
		fetchDailyStatus(currentDate.getMonth() + 1, currentDate.getFullYear());
	});

	async function fetchDailyStatus(month, year) {
		try {
			const res = await fetch(`/api/daily-status?month=${month}&year=${year}`);
			if (res.ok) {
				const data = await res.json();
				dailyStatuses = data.reduce((acc, item) => {
					const dateStr = new Date(item.date).toISOString().split('T')[0];
					acc[dateStr] = item.status;
					return acc;
				}, {});
			}
		} catch (err) {
			console.error('Error fetching daily status:', err);
		}
	}

	function getStatusColor(date) {
		const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
			.toString()
			.padStart(2, '0')}-${date.toString().padStart(2, '0')}`;

		const status = dailyStatuses[dateStr];

		return (
			{
				on_track: 'bg-green-500',
				caution: 'bg-yellow-500',
				overspending: 'bg-red-500'
			}[status] || 'bg-gray-300'
		);
	}

	// Existing calendar functions (prevMonth, nextMonth, etc.)
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
				<button onclick={toggleMonthPicker} class="rounded px-2 py-1 font-medium hover:bg-gray-200">
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
				<button onclick={toggleYearPicker} class="rounded px-2 py-1 font-medium hover:bg-gray-200">
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

			<div class="flex flex-col items-center">
				<button
					onclick={() => selectDate(date)}
					class="h-8 w-8 rounded-full text-center hover:bg-blue-100 {isSelected
						? 'bg-blue-500 text-white'
						: ''} {isToday ? 'border border-blue-500' : ''}"
				>
					{date}
				</button>
				<div class={`mt-1 h-2 w-2 rounded-full ${getStatusColor(date)}`}></div>
			</div>
		{/each}
	</div>
</div>
