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
	let selectedGoal = $state(null); // Track the currently viewed goal
	let topUpAmount = $state(''); // For the "Top Up" input

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

	async function addToCurrentAmount() {
		if (!selectedGoal || !topUpAmount) return;

		try {
			const newAmount = parseFloat(selectedGoal.current_amount) + parseFloat(topUpAmount);
			const res = await fetch(`/api/saving-goals/${selectedGoal.id}`, {
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

			topUpAmount = '';
			await loadSavings();
			selectedGoal = goals.find((g) => g.id === selectedGoal.id); // Refresh selected goal
		} catch (error) {
			console.error('Error updating amount:', error);
			errorMessage = 'Failed to update amount';
		}
	}

	function showSaving(id) {
		selectedGoal = goals.find((goal) => goal.id === id);
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
	<!-- Sidenav -->
	<div class="ml-5 flex h-[95%] w-1/5 flex-col rounded-xl shadow-lg">
		<Sidenav />
	</div>

	<!-- Middle Section: Goal Creation -->
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
					>
						Add Goal
					</Button>
				</form>
			</div>
		</Card>
		<Card variant="secondary" className="h-[45%] w-full my-auto">
			<h2
				class="py- mx-auto mt-5 flex w-[92%] items-center justify-center rounded-md bg-gradient-to-r from-green-500 to-green-700 py-2 text-center text-lg font-semibold tracking-wide text-white"
			>
				SAVING GOALS LIST
			</h2>
			<div class="max-h-[300px] overflow-y-auto p-4">
				{#each unCompleted as goal (goal.id)}
					<button
						type="button"
						aria-label="Saving Goal Item"
						class="mx-auto my-2 flex w-[90%] cursor-pointer items-center justify-between rounded-lg border border-gray-300 px-4 py-2 shadow-lg hover:bg-gray-50 focus:ring-2 focus:ring-green-400 focus:outline-none"
						onclick={() => showSaving(goal.id)}
					>
						<div class="flex w-full items-center justify-between">
							<h3 class="text-lg font-semibold text-gray-800">{goal.goal_title}</h3>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-6 text-gray-500 hover:text-green-600"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
								/>
							</svg>
						</div>
					</button>
				{/each}
			</div>
		</Card>
	</div>

	<!-- Right Section: Goal Details + Top-Up History -->
	<div class="mx-auto flex h-[95%] w-[35%] flex-col">
		<Card variant="secondary" className="h-[95%] w-full my-auto overflow-y-auto">
			{#if selectedGoal}
				<div class="p-6">
					<h2 class="mb-4 text-xl font-semibold text-gray-800">GOAL DETAILS</h2>
					<div class="mb-6 rounded-lg border border-gray-200 p-4">
						<!-- Goal Title -->
						<h3 class="text-lg font-bold text-gray-800">{selectedGoal.goal_title}</h3>

						<!-- Stacked Metrics + Circular Progress Bar -->
						<div class="flex items-center justify-between gap-4">
							<!-- Left: Stacked Target/Achieved/Remaining -->
							<div class="flex-1 space-y-3">
								<div>
									<p class="text-sm text-gray-600">Target</p>
									<p class="text-lg font-semibold">{formatCurrency(selectedGoal.goal_amount)}</p>
								</div>
								<div>
									<p class="text-sm text-gray-600">Achieved</p>
									<p class="text-lg font-semibold">{formatCurrency(selectedGoal.current_amount)}</p>
								</div>
								<div>
									<p class="text-sm text-gray-600">Remaining</p>
									<p class="text-lg font-semibold">
										{formatCurrency(selectedGoal.goal_amount - selectedGoal.current_amount)}
									</p>
								</div>
							</div>

							<!-- Right: Circular Progress Bar -->
							<div class="relative mr-15 h-50 w-50">
								<svg class="h-full w-full" viewBox="0 0 100 100">
									<!-- Background Circle -->
									<circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="8" />
									<!-- Progress Circle -->
									<circle
										cx="50"
										cy="50"
										r="45"
										fill="none"
										stroke="#10b981"
										stroke-width="8"
										stroke-dasharray="283"
										stroke-dashoffset={283 -
											(283 *
												calculateProgress(selectedGoal.current_amount, selectedGoal.goal_amount)) /
												100}
										stroke-linecap="round"
										transform="rotate(-90 50 50)"
									/>
								</svg>
								<!-- Percentage Text (Dynamic) -->
								<div
									class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
								>
									<span class="text-2xl font-bold text-gray-800">
										{Math.round(
											calculateProgress(selectedGoal.current_amount, selectedGoal.goal_amount)
										)}%
									</span>
								</div>
							</div>
						</div>

						<!-- Top-Up Input -->
						<div class="mt-6 flex gap-2">
							<input
								type="number"
								bind:value={topUpAmount}
								placeholder="Enter amount"
								class="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
								min="0"
								step="0.01"
							/>
							<Button on:click={addToCurrentAmount} variant="primary" className="px-4 py-2">
								Top Up
							</Button>
						</div>
					</div>

					<!-- Top-Up History Section -->
					<div class="mt-6">
						<div class="mb-4 flex items-center justify-between">
							<h2 class="text-xl font-semibold text-gray-800">TOP-UP HISTORY</h2>
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
						<div class="rounded-lg border border-gray-200">
							{#if selectedGoal.transactions?.length}
								{#each selectedGoal.transactions as transaction (transaction.id)}
									<div
										class="flex items-center justify-between border-b border-gray-200 px-4 py-3 last:border-b-0"
									>
										<div>
											<p class="font-semibold">{formatCurrency(transaction.amount)}</p>
											<p class="text-sm text-gray-500">{formatDate(transaction.date)}</p>
										</div>
										<div class="flex gap-2">
											<Button variant="ghost" className="text-blue-500 hover:bg-blue-50"
												>Edit</Button
											>
											<Button variant="ghost" className="text-red-500 hover:bg-red-50"
												>Delete</Button
											>
										</div>
									</div>
								{/each}
							{:else}
								<p class="p-4 text-center text-gray-500">No top-up history yet.</p>
							{/if}
						</div>
					</div>
				</div>
			{:else}
				<div class="flex h-full items-center justify-center p-6">
					<p class="text-gray-500">Select a goal to view details.</p>
				</div>
			{/if}
		</Card>
	</div>
</div>

<style>
	progress {
		-webkit-appearance: none;
		appearance: none;
		height: 8px;
		border-radius: 4px;
	}
	progress::-webkit-progress-bar {
		background-color: #e5e7eb;
		border-radius: 4px;
	}
	progress::-webkit-progress-value {
		background-color: #10b981;
		border-radius: 4px;
	}
</style>
