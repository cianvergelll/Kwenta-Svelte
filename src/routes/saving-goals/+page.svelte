<script>
	import Card from '../../components/Card.svelte';
	import Sidenav from '../../components/Sidenav.svelte';
	import Button from '../../components/Button.svelte';
	import { onMount } from 'svelte';

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
			current_amount = 0;
			goal_date = '';
			isCompleted = false;
			await loadBills();
		} catch (error) {
			console.error('Error adding saving goal:', error);
			errorMessage = 'Failed to add saving goal';
		}
	}
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
						placeholder="Add bill title..."
						class="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
						required
					/>

					<div class="relative">
						<span class="absolute top-1/2 left-4 -translate-y-1/2 text-lg font-bold text-gray-600"
						></span>
						<input
							type="number"
							bind:value={goal_amount}
							placeholder="₱00.00"
							class="w-full rounded-lg border border-gray-300 px-10 py-2 text-center text-2xl font-semibold focus:ring-2 focus:ring-green-400 focus:outline-none"
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
								d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a1 1 0 10-2 0v.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
							/>
						</svg>
					</Button>
				</form>
			</div>
		</Card>
		<Card variant="secondary" className="h-[45%] w-full my-auto"></Card>
	</div>
	<div class="mx-auto flex h-[95%] w-[35%] flex-col">
		<Card variant="secondary" className="h-[95%] w-full my-auto"></Card>
	</div>
</div>
