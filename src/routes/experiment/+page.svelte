<script>
	import LoadingPage from '../../components/LoadingPage.svelte';
	let isLoading = true;

	setTimeout(() => {
		isLoading = false;
	}, 300000000);
</script>

{#if isLoading}
	<LoadingPage />
{:else}
	<h1>Kwenta Finance Tracker</h1>
{/if}
