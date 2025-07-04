<script>
	import Sidenav from '../../components/Sidenav.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Button from '../../components/Button.svelte';
	import Card from '../../components/Card.svelte';

	async function getAuthHeaders() {
		const token = localStorage.getItem('sessionToken');
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		};
	}

	const inputStyle =
		'w-[90%] py-2 border border-white rounded-lg pl-4 mb-2 text-white placeholder:text-white';
</script>

<div class="flex h-screen w-screen items-center justify-start bg-gray-100">
	<div class="ml-5 flex h-[95%] w-1/5 flex-col rounded-xl shadow-lg">
		<Sidenav />
	</div>
</div>
