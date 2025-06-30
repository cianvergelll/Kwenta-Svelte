<script>
	import Sidenav from '../../components/Sidenav.svelte';

	async function getAuthHeaders() {
		const token = localStorage.getItem('sessionToken');
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		};
	}
</script>

<div class="flex h-screen w-screen items-center justify-start bg-gray-100">
	<div class="ml-5 flex h-[95%] w-1/5 flex-col rounded-xl shadow-lg"><Sidenav /></div>
</div>
