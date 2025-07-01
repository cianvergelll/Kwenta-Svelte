<script>
	import { fade } from 'svelte/transition';
	export let category_budgets;
	export let categories;
	export let categorySpending;
	export let isEditMode;
	export let removeBudget;
	export let getCategoryColor;
	export let isOnPage;
</script>

{#if isOnPage}
	<div class="flex-1">
		<div class="space-y-3">
			{#each category_budgets as item (item.id)}
				<div transition:fade class="rounded-lg border border-gray-200 p-3">
					<div class="mb-1 flex items-center justify-between text-sm">
						<span>{categories.find((c) => c.name === item.category)?.label}</span>
						<div class="flex items-center">
							<span class="mr-2 font-medium">
								₱{Math.max(
									0,
									item.amount - (categorySpending[item.category] || 0)
								).toLocaleString()}
								<span class="text-xs text-gray-500">
									(remaining of ₱{item.amount.toLocaleString()})
								</span>
							</span>
							{#if isEditMode}
								<button
									aria-label="Remove budget"
									on:click={() => removeBudget(item.id)}
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
							style="width: {Math.max(
								0,
								100 - ((categorySpending[item.category] || 0) / item.amount) * 100
							)}%"
						></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="w-full flex-1 p-4">
		<div class="space-y-4 overflow-y-auto">
			{#each category_budgets as item (item.id)}
				<div transition:fade class="w-full flex-1 p-1">
					<div class="mb-1 flex items-center justify-between">
						<span class="text-sm font-medium">
							{categories.find((c) => c.name === item.category)?.label}
						</span>
						<span class="text-sm font-medium">
							{Math.max(
								0,
								100 - Math.round(((categorySpending[item.category] || 0) / item.amount) * 100)
							)}% remaining
						</span>
					</div>
					<div class="h-1 w-full rounded-full bg-gray-200">
						<div
							class="h-2 rounded-full {getCategoryColor(item.category)}"
							style="width: {Math.max(
								0,
								100 - ((categorySpending[item.category] || 0) / item.amount) * 100
							)}%"
						></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
