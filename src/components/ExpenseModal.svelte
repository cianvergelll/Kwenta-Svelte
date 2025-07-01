<script>
	import Button from './Button.svelte';

	export let showModal;
	export const editingExpenses = null;
	export let modalCategory;
	export let modalAmount;
	export let modalNote;

	export let closeModal;
	export let saveExpense;

	function getCategoryClass(category) {
		switch (category) {
			case 'utilities':
				return 'bg-gradient-to-r from-blue-500 to-blue-800';
			case 'food':
				return 'bg-gradient-to-r from-pink-500 to-pink-800';
			case 'transportation':
				return 'bg-gradient-to-r from-yellow-500 to-yellow-800';
			case 'entertainment':
				return 'bg-gradient-to-r from-purple-500 to-purple-800';
			case 'other':
				return 'bg-gradient-to-r from-gray-400 to-gray-700';
			case 'bill':
				return 'bg-gradient-to-r from-green-400 to-green-700';
			default:
				return 'bg-white';
		}
	}
</script>

{#if showModal}
	<div class="bac fixed inset-0.5 z-50 flex items-center justify-center">
		<button
			class="bg-opacity-40 inset- absolute inset-0 backdrop-blur-sm"
			on:click={closeModal}
			on:keydown={(e) => e.key === 'Enter' && closeModal()}
			aria-label="Close modal"
		>
			<span class="sr-only">Close modal</span>
		</button>

		<div
			class="relative w-full max-w-md rounded-lg p-6 text-white shadow-xl {getCategoryClass(
				modalCategory
			)}"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<h3 id="modal-title" class="mb-4 text-xl font-bold">Edit Expense</h3>

			<div class="mb-4">
				<label for="category" class="mb-1 block text-sm font-medium">Category</label>
				<select
					id="category"
					bind:value={modalCategory}
					class="w-full rounded border p-2 text-gray-800"
				>
					<option value="" disabled>Select a category</option>
					<option value="food">Food</option>
					<option value="transportation">Transportation</option>
					<option value="utilities">Utilities</option>
					<option value="entertainment">Entertainment</option>
					<option value="other">Other</option>
					<option value="bill">Bill</option>
				</select>
			</div>

			<div class="mb-4">
				<label for="amount" class="mb-1 block text-sm font-medium">Amount</label>
				<input
					id="amount"
					type="number"
					bind:value={modalAmount}
					class="w-full rounded border p-2 text-gray-800"
					placeholder="Expense amount"
				/>
			</div>

			<div class="mb-4">
				<label for="note" class="mb-1 block text-sm font-medium">Note</label>
				<input
					id="note"
					bind:value={modalNote}
					class="w-full rounded border p-2 text-gray-800"
					placeholder="Expense note"
				/>
			</div>

			<div class="flex justify-end space-x-2">
				<Button
					ariaLabel="Cancel"
					type="button"
					variant="danger"
					action={closeModal}
					className="w-[20%]">Cancel</Button
				>
				<Button
					ariaLabel="Save"
					type="button"
					variant="save"
					action={saveExpense}
					className="w-[20%]"
				></Button>
			</div>
		</div>
	</div>
{/if}
