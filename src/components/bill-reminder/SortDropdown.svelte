<script>
	export let currentSortMethod;
	export let onSort;

	let isOpen = false;

	const sortMethods = [
		{ value: 'date-asc', label: 'Date (Earliest First)' },
		{ value: 'date-desc', label: 'Date (Latest First)' },
		{ value: 'amount-asc', label: 'Amount (Lowest First)' },
		{ value: 'amount-desc', label: 'Amount (Highest First)' }
	];
</script>

<div class="relative">
	<button
		on:click={() => (isOpen = !isOpen)}
		class="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
	>
		Sort According to
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if isOpen}
		<div
			class="ring-opacity-5 absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black"
		>
			<div class="py-1">
				{#each sortMethods as method}
					<button
						on:click={() => {
							onSort(method.value);
							isOpen = false;
						}}
						class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
					>
						{method.label}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
