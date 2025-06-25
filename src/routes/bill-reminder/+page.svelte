<script>
	import SideNav from '../../components/Sidenav.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

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
				return;
			}
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
			<div class="h-full w-1/2 rounded-lg border border-gray-300 bg-white p-4"></div>
			<div class="h-full w-1/2 rounded-lg border border-gray-300 bg-white p-4"></div>
		</div>

		<!-- Bottom Full Width Section -->
		<div class="h-[50%] w-full rounded-lg border border-gray-300 bg-white p-4"></div>
	</div>
</div>
