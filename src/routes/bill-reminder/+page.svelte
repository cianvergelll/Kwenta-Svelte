<script>
	import SideNav from '../../components/Sidenav.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let bill_title = '';
	let bill_amount = '';
	let bill_date = '';
	let recurring_bill = false;
	let isPaid = false;

	async function getAuthHeaders() {
		const token = localStorage.getItem('sessionToken');
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		};
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
		} catch (error) {
			console.error('Session verification failed:', error);
			goto('/login');
		}
	});

	function addBill(event) {
		event.preventDefault();
		console.log('Bill Added:', {
			title: bill_title,
			amount: bill_amount,
			date: bill_date,
			recurring: recurring_bill
		});
	}
</script>

<div class="flex h-screen w-screen bg-gray-100">
	<!-- Side Navigation -->
	<div class="ml-5 flex h-[95%] w-1/5 flex-col self-center rounded-xl shadow-lg">
		<SideNav />
	</div>

	<!-- Main Content Area -->
	<div class="flex h-[95%] w-[76%] flex-col gap-5 self-center p-4">
		<!-- Top Row - Two Equal Columns -->
		<div class="flex h-[50%] w-full flex-row gap-5">
			<!-- Bill Form Section (Updated) -->
			<div class="flex h-full w-1/2 rounded-lg border border-gray-300 bg-white shadow-sm">
				<!-- Bills Reminder Card - Modified to fill parent -->
				<div class="flex w-full flex-col">
					<h2
						class="py- mx-auto mt-5 flex w-[92%] items-center justify-center rounded-md bg-gradient-to-r from-green-500 to-green-700 py-2 text-center text-lg font-semibold tracking-wide text-white"
					>
						BILLS REMINDER
					</h2>

					<form on:submit={addBill} class="flex h-full flex-col gap-4 p-6">
						<!-- Title Input -->
						<input
							type="text"
							bind:value={bill_title}
							placeholder="Add bill title..."
							class="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
							required
						/>

						<!-- Amount Input -->
						<div class="relative">
							<span class="absolute top-1/2 left-4 -translate-y-1/2 text-lg font-bold text-gray-600"
							></span>
							<input
								type="number"
								bind:value={bill_amount}
								placeholder="₱00.00"
								class="w-full rounded-lg border border-gray-300 px-10 py-2 text-center text-2xl font-semibold focus:ring-2 focus:ring-green-400 focus:outline-none"
								required
							/>
						</div>

						<!-- Date and Recurring -->
						<div class="flex gap-2">
							<!-- Due Date Dropdown -->
							<input
								type="date"
								bind:value={bill_date}
								class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-green-400 focus:outline-none"
								required
							/>

							<!-- Recurring Checkbox -->
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
							>
								<input type="checkbox" bind:checked={recurring_bill} class="peer hidden" />
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

						<!-- Add Reminder Button - Pushed to bottom with mt-auto -->
						<button
							type="submit"
							class="mt-auto flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
						>
							Add reminder
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
						</button>
					</form>
				</div>
			</div>

			<!-- Right Panel (Placeholder) -->
			<div class="h-full w-1/2 rounded-lg border border-gray-300 bg-white p-4 shadow-sm"></div>
		</div>

		<!-- Bottom Full Width Section -->
		<div class="h-[50%] w-full rounded-lg border border-gray-300 bg-white p-4 shadow-sm"></div>
	</div>
</div>
