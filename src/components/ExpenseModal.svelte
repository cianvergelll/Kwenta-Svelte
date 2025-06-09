<script>
	export let showModal;
	export const editingExpenses = null; // Changed to const since it's not modified in this component
	export let modalCategory;
	export let modalAmount;
	export let modalNote;

	export let closeModal;
	export let saveExpense;
</script>

{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<!-- Overlay with button role and keyboard support -->
		<button
			class="bg-opacity-40 absolute inset-0 bg-black backdrop-blur-sm"
			on:click={closeModal}
			on:keydown={(e) => e.key === 'Enter' && closeModal()}
			aria-label="Close modal"
		>
			<span class="sr-only">Close modal</span>
		</button>

		<!-- Modal content -->
		<div
			class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<h3 id="modal-title" class="mb-4 text-xl font-bold">Edit Expense</h3>

			<div class="mb-4">
				<label for="category" class="mb-1 block text-sm font-medium">Category</label>
				<select id="category" bind:value={modalCategory} class="w-full rounded border p-2">
					<option value="" disabled>Select a category</option>
					<option value="food">Food</option>
					<option value="transportation">Transportation</option>
					<option value="utilities">Utilities</option>
					<option value="entertainment">Entertainment</option>
					<option value="other">Other</option>
				</select>
			</div>

			<div class="mb-4">
				<label for="amount" class="mb-1 block text-sm font-medium">Amount</label>
				<input
					id="amount"
					type="number"
					bind:value={modalAmount}
					class="w-full rounded border p-2"
					placeholder="Expense amount"
				/>
			</div>

			<div class="mb-4">
				<label for="note" class="mb-1 block text-sm font-medium">Note</label>
				<input
					id="note"
					bind:value={modalNote}
					class="w-full rounded border p-2"
					placeholder="Expense note"
				/>
			</div>

			<div class="flex justify-end space-x-2">
				<button
					type="button"
					on:click={closeModal}
					class="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
				>
					Cancel
				</button>
				<button
					type="button"
					on:click={saveExpense}
					class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				>
					Save
				</button>
			</div>
		</div>
	</div>
{/if}
