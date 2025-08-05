<script>
	export let formData;
	export let onSubmit;
	export let errorMessage = '';
</script>

<form on:submit|preventDefault={onSubmit} class="flex h-full flex-col gap-4 p-6">
	{#if errorMessage}
		<div class="rounded bg-red-100 p-2 text-red-700">{errorMessage}</div>
	{/if}

	<input
		type="text"
		bind:value={formData.bill_title}
		placeholder="Add bill title..."
		class="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
		required
	/>

	<div class="relative">
		<span class="absolute top-1/2 left-4 -translate-y-1/2 text-lg font-bold text-gray-600">₱</span>
		<input
			type="number"
			bind:value={formData.bill_amount}
			placeholder="00.00"
			class="w-full rounded-lg border border-gray-300 px-10 py-2 text-center text-2xl font-semibold focus:ring-2 focus:ring-green-400 focus:outline-none"
			required
		/>
	</div>

	<div class="flex gap-2">
		<input
			type="date"
			bind:value={formData.due_date}
			class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-green-400 focus:outline-none"
			required
		/>

		<label
			class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
		>
			<input type="checkbox" bind:checked={formData.recurring_bill} class="peer hidden" />
			<span
				class="flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300 peer-checked:border-green-500 peer-checked:bg-green-500"
			>
				<svg
					class="hidden h-3 w-3 text-white peer-checked:block"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="3"
						d="M5 13l4 4L19 7"
					/>
				</svg>
			</span>
			<span>Recurring Bill</span>
		</label>
	</div>

	<button
		type="submit"
		class="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
	>
		Add Bill
	</button>
</form>
