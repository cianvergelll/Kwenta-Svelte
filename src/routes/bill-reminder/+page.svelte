<script>
	import SideNav from '../../components/Sidenav.svelte';
	import BillModal from '../../components/BillModal.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let bills = $state([]);
	let bill_title = $state('');
	let bill_amount = $state('');
	let due_date = $state('');
	let recurring_bill = $state(false);
	let isPaid = $state(false);
	let paid_date = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');
	let paidBills = $state([]);
	let unpaidBills = $state([]);

	let isModalOpen = $state(false);
	let editingBill = $state(null);
	let modalTitle = $state('');
	let modalAmount = $state('');
	let modalDueDate = $state('');
	let modalRecurring = $state(false);

	async function getAuthHeaders() {
		const token = localStorage.getItem('sessionToken');
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		};
	}

	async function loadBills() {
		isLoading = true;
		errorMessage = '';
		try {
			const res = await fetch('/api/bill-reminder', {
				headers: await getAuthHeaders()
			});

			if (!res.ok) {
				const err = await res.json();
				errorMessage = err.error || 'Failed to load bills';
				return;
			}

			const data = await res.json();
			bills = data;

			unpaidBills = [...data.filter((bill) => !bill.isPaid)];
			paidBills = [...data.filter((bill) => bill.isPaid)];
		} catch (error) {
			console.error('Error loading bills:', error);
			errorMessage = 'Network error';
		} finally {
			isLoading = false;
		}
	}

	async function markAsPaid(bill) {
		try {
			const res = await fetch(`/api/bill-reminder/${bill.id}`, {
				method: 'PUT',
				headers: await getAuthHeaders(),
				body: JSON.stringify({
					...bill,
					isPaid: true,
					paid_date: new Date().toISOString()
				})
			});

			if (res.ok) {
				await loadBills();
			}
		} catch (error) {
			console.error('Error marking bill as paid:', error);
		}
	}

	async function markAsUnpaid(bill) {
		try {
			const res = await fetch(`/api/bill-reminder/${bill.id}`, {
				method: 'PUT',
				headers: await getAuthHeaders(),
				body: JSON.stringify({
					...bill,
					isPaid: false,
					paid_date: null
				})
			});

			if (res.ok) {
				await loadBills(); // This will refresh both lists
			}
		} catch (error) {
			console.error('Error marking bill as unpaid:', error);
		}
	}

	async function addBill() {
		errorMessage = '';
		try {
			const res = await fetch('/api/bill-reminder', {
				method: 'POST',
				headers: await getAuthHeaders(),
				body: JSON.stringify({
					bill_title,
					bill_amount,
					due_date,
					recurring_bill,
					isPaid,
					paid_date
				})
			});

			if (!res.ok) {
				const err = await res.json();
				errorMessage = err.error || 'Failed to add bill';
				return;
			}

			bill_title = '';
			bill_amount = '';
			due_date = '';
			recurring_bill = false;
			isPaid = false;
			paid_date = '';
			await loadBills();
		} catch (error) {
			console.error('Error adding bills:', error);
			errorMessage = 'Network error';
		}
	}

	async function deleteBill(id) {
		if (!confirm('Are you sure you want to delete this Bill?')) return;

		try {
			const res = await fetch(`/api/bill-reminder/${id}`, {
				method: 'DELETE',
				headers: await getAuthHeaders()
			});

			if (!res.ok) {
				const err = await res.json();
				errorMessage = err.error || 'Failed to delete bill';
				return;
			}

			await loadBills();
		} catch (error) {
			console.error('Error deleting bill:', error);
			errorMessage = 'Network error';
		}
	}

	function openEditModal(bill) {
		editingBill = bill;
		modalTitle = bill.bill_title;
		modalAmount = bill.bill_amount;
		modalDueDate = bill.due_date.split('T')[0];
		modalRecurring = bill.recurring_bill;
		isModalOpen = true;
	}

	async function saveEditedBill() {
		try {
			const res = await fetch(`/api/bill-reminder/${editingBill.id}`, {
				method: 'PUT',
				headers: await getAuthHeaders(),
				body: JSON.stringify({
					...editingBill,
					bill_title: modalTitle,
					bill_amount: modalAmount,
					due_date: modalDueDate,
					recurring_bill: modalRecurring
				})
			});
			if (!res.ok) throw new Error('Failed to update');
			await loadBills();
			isModalOpen = false;
		} catch (error) {
			errorMessage = error.message;
		}
	}

	function formatDate(dateString) {
		const options = { year: 'numeric', month: 'long', day: 'numeric' };
		return new Date(dateString).toLocaleDateString('en-US', options);
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

			await loadBills();
		} catch (error) {
			console.error('Session verification failed:', error);
			goto('/login');
		}
	});
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

					<form onsubmit={addBill} class="flex h-full flex-col gap-4 p-6">
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
								bind:value={due_date}
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

			<!-- Right Panel (Placeholder)-->
			<div class="h-full w-1/2 rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
				<div
					class="rounded-lg bg-gradient-to-r from-green-600 to-green-700 py-3 text-center font-semibold text-white shadow"
				>
					PAID BILLS
				</div>
				<div class="max-h-[calc(100%-3.5rem)] overflow-y-auto">
					{#each paidBills as bill}
						<!-- Bill Item 1 -->
						<div class="mb-2 flex items-start justify-between rounded-xl bg-white px-4 py-3 shadow">
							<div>
								<h3 class="text-lg font-bold text-gray-800">{bill.bill_title}</h3>
								<p class="text-sm text-gray-600">Due Date: {formatDate(bill.due_date)}</p>
								<p class="text-sm text-gray-600">Bill Amount: ₱{bill.bill_amount}</p>
								<p class="mt-1 text-sm font-semibold text-green-700">
									Paid On: {formatDate(bill.paid_date)}
								</p>
							</div>
							<button
								aria-label="Delete"
								class="mt-1 text-red-600 hover:text-red-800"
								onclick={() => markAsUnpaid(bill)}
							>
								<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
									<circle cx="10" cy="10" r="10" />
									<line
										x1="6"
										y1="10"
										x2="14"
										y2="10"
										stroke="white"
										stroke-width="2"
										stroke-linecap="round"
									/>
								</svg>
							</button>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Display -->
		<div class="h-[50%] w-full rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-green-800">BILLS TO BE PAID</h2>
				<button
					class="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
				>
					Sort According to
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>
			</div>

			<!-- Bill Header -->
			<div class="mb-2">
				<!-- Header Row -->
				<div
					class="flex items-center justify-between rounded-xl bg-green-100 px-3 py-2 font-semibold"
				>
					<!-- Left side (empty space to align with checkbox) -->
					<div class="flex w-1/6 items-center">
						<span class="text-green-600">Status</span>
					</div>

					<!-- Centered content -->
					<div class="flex w-4/6 items-center justify-between">
						<!-- Bill Title Header -->
						<div class="w-1/3 text-center text-green-800">BILL TITLE</div>
						<!-- Due Date Header -->
						<div class="w-1/3 text-center text-green-800">DUE DATE</div>

						<!-- Amount Header -->
						<div class="w-1/3 text-center text-green-800">AMOUNT</div>
					</div>

					<!-- Right side (empty space to align with buttons) -->
					<div class="flex w-1/6 justify-end">
						<span class="text-green-800">ACTIONS</span>
					</div>
				</div>
			</div>
			<div class="max-h-[calc(100%-7rem)] overflow-y-auto">
				{#if isLoading && bills.length === 0}
					<div class="py-8 text-center">Loading bills...</div>
				{:else}
					{#each unpaidBills as bill}
						<!-- Bill Item -->
						<div class="mb-2 space-y-3">
							<!-- Row Start -->
							<div
								class="flex items-center justify-between rounded-xl border bg-white px-3 py-2 shadow-sm"
							>
								<!-- Left side (Check icon) -->
								<button
									type="button"
									class="flex w-1/6 items-center focus:outline-none"
									aria-label="Mark as paid"
									onclick={() => markAsPaid(bill)}
								>
									<div class="text-green-600">
										<svg class="ml-2 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<circle cx="12" cy="12" r="10" stroke-width="2" />
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 12l2 2 4-4"
											/>
										</svg>
									</div>
								</button>

								<!-- Centered content -->
								<div class="flex w-4/6 items-center justify-between">
									<!-- Bill Title -->
									<input
										type="text"
										value={bill.bill_title}
										class="w-1/3 rounded-full border-none bg-white px-3 py-2 text-center text-sm font-semibold uppercase outline-none"
										readonly
									/>

									<!-- Due Date -->
									<input
										type="text"
										value={formatDate(bill.due_date)}
										class="w-1/3 rounded-full border-none bg-white px-2 py-2 text-center text-sm outline-none"
										readonly
									/>

									<!-- Amount -->
									<input
										type="text"
										value={bill.bill_amount}
										class="w-1/3 rounded-full border-none bg-white px-2 py-2 text-center text-sm font-semibold outline-none"
										readonly
									/>
								</div>

								<!-- Right side (Buttons) -->
								<div class="flex w-1/6 justify-end">
									<!-- Edit -->
									<button
										aria-label="Edit"
										onclick={() => openEditModal(bill)}
										class="ml-2 text-green-600 hover:text-green-800"
									>
										<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M11 5h2M5 19h14M16 3l5 5-11 11H5v-5L16 3z"
											/>
										</svg>
									</button>

									<!-- Delete -->
									<button
										aria-label="Delete"
										class="ml-2 text-red-600 hover:text-red-800"
										onclick={() => deleteBill(bill.id)}
									>
										<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>

<BillModal
	bind:isModalOpen
	bind:modalTitle
	bind:modalAmount
	bind:modalDueDate
	bind:modalRecurring
	{saveEditedBill}
/>
