<script>
	import Sidenav from '../../components/Sidenav.svelte';

	let name = '';
	let targetAmount = '';
	let targetDate = '';
	let description = '';
	let message = '';
	let error = '';

	async function getAuthHeaders() {
		const token = localStorage.getItem('sessionToken');
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		};
	}

</script>

<div class="flex h-screen w-screen bg-gray-100">
	<!-- Sidenav -->
	<div class="ml-5 flex h-[95%] w-1/5 flex-col self-center rounded-xl shadow-lg">
		<Sidenav />
	</div>
	<!-- Main content -->
	<div class="flex-1 overflow-auto p-6">
		<div class="mx-auto max-w-3xl">
			<h1 class="mb-6 text-2xl font-bold text-gray-900">Create a Saving Goal</h1>
			<form class="space-y-6 rounded-lg bg-white p-6 shadow" on:submit|preventDefault={createGoal}>
				<div>
					<label class="mb-1 block font-medium text-gray-700" for="name">Goal Name</label>
					<input
						id="name"
						type="text"
						bind:value={name}
						required
						class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
					/>
				</div>
				<div>
					<label class="mb-1 block font-medium text-gray-700" for="amount">Target Amount (₱)</label>
					<input
						id="amount"
						type="number"
						min="1"
						bind:value={targetAmount}
						required
						class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
					/>
				</div>
				<div>
					<label class="mb-1 block font-medium text-gray-700" for="date">Target Date</label>
					<input
						id="date"
						type="date"
						bind:value={targetDate}
						class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
					/>
				</div>
				<div>
					<label class="mb-1 block font-medium text-gray-700" for="desc">Description</label>
					<textarea
						id="desc"
						bind:value={description}
						rows="2"
						class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
					></textarea>
				</div>
				<button
					type="submit"
					class="w-full rounded bg-green-600 py-2 font-bold text-white transition-colors hover:bg-green-700"
				>
					Create Goal
				</button>
				{#if message}
					<p class="mt-2 text-center text-green-600">{message}</p>
				{/if}
				{#if error}
					<p class="mt-2 text-center text-red-600">{error}</p>
				{/if}
			</form>
		</div>
	</div>
</div>
