<script>
	export let isModalOpen;
	export let modalTitle;
	export let modalAmount;
	export let modalDueDate;
	export let modalRecurring;
	export let saveEditedBill;
</script>

{#if isModalOpen}
	<div
		class="bg-opacity-40 fixed inset-0 z-40 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300"
	>
		<div class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h2 class="mb-4 text-xl font-bold text-gray-800">Edit Bill</h2>

			<div class="mb-4">
				<label for="edit-title" class="mb-1 block text-sm font-medium text-gray-700">Title</label>
				<input
					id="edit-title"
					bind:value={modalTitle}
					class="w-full rounded border border-gray-300 p-2"
					required
				/>
			</div>

			<div class="mb-4">
				<label for="edit-amount" class="mb-1 block text-sm font-medium text-gray-700">Amount</label>
				<input
					id="edit-amount"
					type="number"
					bind:value={modalAmount}
					class="w-full rounded border border-gray-300 p-2"
					required
				/>
			</div>

			<div class="mb-4">
				<label for="edit-due-date" class="mb-1 block text-sm font-medium text-gray-700"
					>Due Date</label
				>
				<input
					id="edit-due-date"
					type="date"
					bind:value={modalDueDate}
					class="w-full rounded border border-gray-300 p-2"
					required
				/>
			</div>

			<div class="mb-4 flex items-center">
				<input
					id="edit-recurring"
					type="checkbox"
					bind:checked={modalRecurring}
					class="h-4 w-4 rounded text-green-600"
				/>
				<label for="edit-recurring" class="ml-2 text-sm text-gray-700">Recurring Bill</label>
			</div>

			<div class="flex justify-end space-x-2">
				<button
					onclick={() => (isModalOpen = false)}
					class="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
				>
					Cancel
				</button>
				<button
					onclick={saveEditedBill}
					class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
				>
					Save Changes
				</button>
			</div>
		</div>
	</div>
{/if}
