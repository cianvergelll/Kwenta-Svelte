<script>
	import Card from '../../components/Card.svelte';
	import Sidenav from '../../components/Sidenav.svelte';
	import Button from '../../components/Button.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let goals = $state([]);
	let goal_title = $state('');
	let goal_amount = $state('');
	let current_amount = $state('');
	let goal_date = $state('');
	let isCompleted = $state(false);
	let isLoading = $state(false);
	let errorMessage = $state('');
	let completed = $state([]);
	let unCompleted = $state([]);
	let currentSortMethod = $state('date-asc');
	let sortDropdownOpen = $state(false);

	async function getAuthHeaders() {
		const token = localStorage.getItem('sessionToken');
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		};
	}

	function sortSavings() {
		switch (currentSortMethod) {
			case 'date-asc':
				unCompleted.sort((a, b) => new Date(a.goal_date) - new Date(b.goal_date));
				break;
			case 'date-desc':
				unCompleted.sort((a, b) => new Date(b.goal_date) - new Date(a.goal_date));
				break;
			case 'amount-asc':
				unCompleted.sort((a, b) => parseFloat(a.goal_amount) - parseFloat(b.goal_amount));
				break;
			case 'amount-desc':
				unCompleted.sort((a, b) => parseFloat(b.goal_amount) - parseFloat(a.goal_amount));
				break;
			default:
				unCompleted.sort((a, b) => new Date(a.goal_date) - new Date(b.goal_date));
		}
	}

	async function loadSavings() {
		isLoading = true;
		errorMessage = '';
		try {
			const res = await fetch('api/saving-goals', {
				headers: await getAuthHeaders()
			});

			if (!res.ok) {
				const err = await res.json();
				errorMessage = err.error || 'Failed to load savings';
				return;
			}

			const data = await res.json();
			goals = data;

			completed = [...data.filter((goal) => goal.isCompleted)];
			unCompleted = [...data.filter((goal) => !goal.isCompleted)];

			sortSavings();
		} catch (error) {
			console.error('Error loading savings:', error);
			errorMessage = 'Failed to load savings';
		} finally {
			isLoading = false;
		}
	}

	async function addSaving() {
		errorMessage = '';
		try {
			const res = await fetch('/api/saving-goals', {
				method: 'POST',
				headers: await getAuthHeaders(),
				body: JSON.stringify({
					goal_title,
					goal_amount,
					current_amount,
					goal_date,
					isCompleted
				})
			});

			if (!res.ok) {
				const err = await res.json();
				errorMessage = err.error || 'Failed to add saving goal';
				return;
			}

			goal_title = '';
			goal_amount = '';
			current_amount = '';
			goal_date = '';
			isCompleted = false;
			await loadSavings();
		} catch (error) {
			console.error('Error adding saving goal:', error);
			errorMessage = 'Failed to add saving goal';
		}
	}

	async function deleteSaving(id) {
		if (!confirm('Are you sure you want to delete this saving goal?')) return;

		try {
			const res = await fetch(`/api/saving-goals/${id}`, {
				method: 'DELETE',
				headers: await getAuthHeaders()
			});

			if (!res.ok) {
				const err = await res.json();
				errorMessage = err.error || 'Failed to delete saving goal';
				return;
			}

			await loadSavings();
		} catch (error) {
			console.error('Error deleting saving goal:', error);
			errorMessage = 'Failed to delete saving goal';
		}
	}

	async function addToCurrentAmount(id, amountToAdd) {
		try {
			const goal = goals.find((g) => g.id === id);
			if (!goal) return;

			const newAmount = parseFloat(goal.current_amount) + parseFloat(amountToAdd);
			const res = await fetch(`/api/saving-goals/${id}`, {
				method: 'PATCH',
				headers: await getAuthHeaders(),
				body: JSON.stringify({
					current_amount: newAmount
				})
			});

			if (!res.ok) {
				const err = await res.json();
				errorMessage = err.error || 'Failed to update amount';
				return;
			}

			await loadSavings();
		} catch (error) {
			console.error('Error updating amount:', error);
			errorMessage = 'Failed to update amount';
		}
	}

	function formatDate(dateString) {
		const options = { year: 'numeric', month: 'long', day: 'numeric' };
		return new Date(dateString).toLocaleDateString('en-US', options);
	}

	function formatCurrency(amount) {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP'
		}).format(amount);
	}

	function handleSort(method) {
		currentSortMethod = method;
		sortSavings();
		sortDropdownOpen = false;
	}

	function calculateProgress(current, goal) {
		return Math.min((current / goal) * 100, 100);
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
			}

			await loadSavings();
		} catch (error) {
			console.error('Session verification failed:', error);
			goto('/login');
		}
	});
</script>

<div class="flex h-screen w-screen items-center justify-start bg-gray-100">
	<div class="ml-5 flex h-[95%] w-1/5 flex-col rounded-xl shadow-lg">
		<Sidenav />
	</div>

	<div class="mx-auto flex h-[95%] w-[35%] flex-col">
		<Card variant="secondary" className="h-[45%] w-full my-auto">
			<div class="flex h-full flex-col items-center justify-center">
				<h2
					class="py- mx-auto mt-5 flex w-[92%] items-center justify-center rounded-md bg-gradient-to-r from-green-500 to-green-700 py-2 text-center text-lg font-semibold tracking-wide text-white"
				>
					SAVING GOALS
				</h2>

				<form onsubmit={addSaving} class="flex h-full w-full flex-col gap-4 p-6">
					<input
						type="text"
						bind:value={goal_title}
						placeholder="Goal title..."
						class="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
						required
					/>

					<div class="relative">
						<span class="absolute top-1/2 left-4 -translate-y-1/2 text-lg font-bold text-gray-600"
							>₱</span
						>
						<input
							type="number"
							bind:value={goal_amount}
							placeholder="00.00"
							class="w-full rounded-lg border border-gray-300 px-10 py-2 text-center text-2xl font-semibold focus:ring-2 focus:ring-green-400 focus:outline-none"
							min="0"
							step="0.01"
							required
						/>
					</div>

					<div class="flex gap-2">
						<input
							type="date"
							bind:value={goal_date}
							class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-green-400 focus:outline-none"
							required
						/>
					</div>

					<Button
						type="submit"
						variant="primary"
						ariaLabel="Add Saving Goal"
						className="flex items-center justify-center gap-2"
					></Button>
				</form>
			</div>
		</Card>
		<Card variant="secondary" className="h-[45%] w-full my-auto">
			<h2
				class="py- mx-auto mt-5 flex w-[92%] items-center justify-center rounded-md bg-gradient-to-r from-green-500 to-green-700 py-2 text-center text-lg font-semibold tracking-wide text-white"
			>
				SAVING GOALS
			</h2>

			{#each unCompleted as goal (goal.id)}
				<div
					class="mx-auto my-2 w-[90%] rounded-lg border border-gray-300 px-4 py-2 shadow-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
				>
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-semibold text-gray-800">{goal.goal_title}</h3>
						<button onclick={() => showSaving(goal.id)} aria-label="View Saving Goal">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-6"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
								/>
							</svg>
						</button>
					</div>
				</div>
			{/each}
		</Card>
	</div>

	<!-- Savings Display -->
	<div class="mx-auto flex h-[95%] w-[35%] flex-col">
		<Card variant="secondary" className="h-[95%] w-full my-auto overflow-y-auto">
			<div class="p-6">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-800">Your Savings Goals</h2>
					<div class="relative">
						<button
							onclick={() => (sortDropdownOpen = !sortDropdownOpen)}
							class="flex items-center gap-1 rounded-lg bg-gray-200 px-3 py-1 text-sm"
						>
							Sort by
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</button>
						{#if sortDropdownOpen}
							<div class="absolute right-0 z-10 mt-1 w-40 rounded-md bg-white shadow-lg">
								<div class="py-1">
									<button
										onclick={() => handleSort('date-asc')}
										class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
									>
										Date (Oldest first)
									</button>
									<button
										onclick={() => handleSort('date-desc')}
										class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
									>
										Date (Newest first)
									</button>
									<button
										onclick={() => handleSort('amount-asc')}
										class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
									>
										Amount (Lowest first)
									</button>
									<button
										onclick={() => handleSort('amount-desc')}
										class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
									>
										Amount (Highest first)
									</button>
								</div>
							</div>
						{/if}
					</div>
				</div>

				{#if isLoading}
					<div class="flex h-64 items-center justify-center">
						<div
							class="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"
						></div>
					</div>
				{:else if errorMessage}
					<div class="rounded-lg bg-red-100 p-3 text-red-700">{errorMessage}</div>
				{:else if unCompleted.length === 0}
					<div class="flex h-64 flex-col items-center justify-center text-gray-500">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-12 w-12"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<p class="mt-2 text-lg">No savings goals yet</p>
					</div>
				{:else}
					<div class="space-y-4">
						{#each unCompleted as goal (goal.id)}
							<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
								<div class="flex items-start justify-between">
									<div>
										<h3 class="text-lg font-semibold text-gray-800">{goal.goal_title}</h3>
										<p class="text-sm text-gray-500">Target: {formatDate(goal.goal_date)}</p>
									</div>
									<button
										aria-label="Delete Saving Goal"
										onclick={() => deleteSaving(goal.id)}
										class="text-gray-400 hover:text-red-500"
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
								</div>

								<div class="mt-4 flex items-center justify-center">
									<div class="relative h-32 w-32">
										<!-- Outer circle (background) -->
										<svg class="h-full w-full" viewBox="0 0 100 100">
											<!-- Gray background circle -->
											<circle
												cx="50"
												cy="50"
												r="45"
												fill="none"
												stroke="#e5e7eb"
												stroke-width="8"
											/>
											<!-- Progress circle -->
											<circle
												cx="50"
												cy="50"
												r="45"
												fill="none"
												stroke="#10b981"
												stroke-width="8"
												stroke-dasharray="283"
												stroke-dashoffset={283 -
													(283 * calculateProgress(goal.current_amount, goal.goal_amount)) / 100}
												stroke-linecap="round"
												transform="rotate(-90 50 50)"
											/>
										</svg>

										<!-- Center content -->
										<div class="absolute inset-0 flex flex-col items-center justify-center">
											<span class="text-xl font-bold text-gray-800">
												{formatCurrency(goal.current_amount)}
											</span>
											<span class="text-sm text-gray-500">
												of {formatCurrency(goal.goal_amount)}
											</span>
										</div>
									</div>
								</div>

								<div class="mt-4 flex items-center justify-between">
									<div class="w-full">
										<div class="flex items-center gap-2">
											<input
												type="number"
												bind:value={goal.tempAddAmount}
												class="flex-1 rounded-lg border border-gray-300 px-3 py-1 text-sm"
												placeholder="Amount to add"
												min="0"
												step="0.01"
											/>
											<button
												onclick={() => addToCurrentAmount(goal.id, goal.tempAddAmount || 0)}
												class="flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-4 w-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M12 6v6m0 0v6m0-6h6m-6 0H6"
													/>
												</svg>
												Add
											</button>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</Card>
	</div>
</div>

<style>
	circle {
		transition: stroke-dashoffset 0.5s ease-in-out;
	}
</style>
