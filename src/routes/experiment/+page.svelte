<!-- src/routes/+page.svelte (or your main page) -->
<script>
	import LoadingPage from '../../components/LoadingPage.svelte';
	let isLoading = true; // Set to false when data loads

	// Simulate loading delay (replace with actual data fetch)
	setTimeout(() => {
		isLoading = false;
	}, 30000);
</script>

{#if isLoading}
	<LoadingPage />
{:else}
	<!-- Your main content here -->
	<h1>Kwenta Finance Tracker</h1>
{/if}
