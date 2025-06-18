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
				<p class="text-center text-gray-500">No budgets added yet</p>
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

		<div class="flex justify-end space-x-4">
			<button class={`${buttonStyle} bg-gray-200 hover:bg-gray-300`}> Edit </button>
			<button class={`${buttonStyle} bg-blue-500 text-white hover:bg-blue-600`}>
				Set Budget
			</button>
		</div>
	</div>

	<div class="mr-5 h-[95%] w-[40%] rounded-lg border border-gray-300 bg-white p-4">
		<div class="mx-auto w-[95%] space-y-4">
			<h2 class="mb-6 text-xl font-bold">Budget Summary</h2>

			<!-- Hardcoded Total Budget -->
			<div class="mx-auto mb-8 w-[95%] rounded-lg bg-gray-50 p-4">
				<div class="mb-1 flex items-center justify-between">
					<span class="font-medium">Total Budget</span>
					<span class="font-medium">₱10,000</span>
				</div>
				<div class="h-2.5 w-full rounded-full bg-gray-200">
					<div class="h-2.5 rounded-full bg-blue-600" style="width: 100%"></div>
				</div>
			</div>

			<!-- Hardcoded Categories with Progress Bars -->
			<div class="mx-auto w-[95%] space-y-4">
				<!-- Food -->
				<div class="rounded-lg border border-gray-200 p-3">
					<div class="mb-1 flex items-center justify-between">
						<span>Food</span>
						<span class="font-medium">₱2,500 remaining (of ₱4,000)</span>
					</div>
					<div class="h-2.5 w-full rounded-full bg-gray-200">
						<div class="h-2.5 rounded-full bg-green-500" style="width: 62.5%"></div>
					</div>
				</div>

				<!-- Transportation -->
				<div class="rounded-lg border border-gray-200 p-3">
					<div class="mb-1 flex items-center justify-between">
						<span>Transportation</span>
						<span class="font-medium">₱1,200 remaining (of ₱2,000)</span>
					</div>
					<div class="h-2.5 w-full rounded-full bg-gray-200">
						<div class="h-2.5 rounded-full bg-yellow-500" style="width: 60%"></div>
					</div>
				</div>

				<!-- Utilities -->
				<div class="rounded-lg border border-gray-200 p-3">
					<div class="mb-1 flex items-center justify-between">
						<span>Utilities</span>
						<span class="font-medium">₱3,000 remaining (of ₱5,000)</span>
					</div>
					<div class="h-2.5 w-full rounded-full bg-gray-200">
						<div class="h-2.5 rounded-full bg-red-500" style="width: 60%"></div>
					</div>
				</div>

				<!-- Entertainment -->
				<div class="rounded-lg border border-gray-200 p-3">
					<div class="mb-1 flex items-center justify-between">
						<span>Entertainment</span>
						<span class="font-medium">₱1,500 remaining (of ₱3,000)</span>
					</div>
					<div class="h-2.5 w-full rounded-full bg-gray-200">
						<div class="h-2.5 rounded-full bg-purple-500" style="width: 50%"></div>
					</div>
				</div>

				<!-- Other -->
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

			<!-- Hardcoded Remaining Total -->
			<div class="mx-auto mt-8 w-[95%] rounded-lg bg-gray-50 p-4">
				<div class="flex items-center justify-between">
					<span class="font-semibold">Total Remaining</span>
					<span class="font-semibold">₱10,000</span>
				</div>
			</div>
		</div>
	</div>
</div>
