<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let name = $state(''),
		email = $state(''),
		password = $state(''),
		confirmPassword = $state('');

	onMount(async () => {
		const token = localStorage.getItem('sessionToken');
		if (token) {
			try {
				const res = await fetch('/api/auth/verify', {
					headers: { Authorization: `Bearer ${token}` }
				});
				if (res.ok) {
					goto('/dashboard');
				}
			} catch (error) {
				console.error('Session verification failed:', error);
			}
		}
	});

	async function register() {
		if (password !== confirmPassword) {
			alert('Passwords do not match');
		} else {
			await fetch('/api/auth/register', {
				method: 'POST',
				body: JSON.stringify({ name, email, password })
			});
			location.href = '/login';
		}
	}

	function handleLogin() {
		location.href = '/login';
	}
</script>

<title>Good Finances</title>
<div class="flex h-screen w-screen items-center justify-center bg-gray-100">
	<div class="flex h-screen w-[70%] flex-col items-start justify-center">
		<p
			class="mb-5 bg-gradient-to-tr from-green-600 to-green-800 bg-clip-text pl-40 text-7xl font-bold text-transparent"
		>
			Right on Track
		</p>
		<p class="pl-40 text-xl">A little more and you will be on track with your finances</p>
	</div>

	<div
		class="mr-40 flex h-[80%] w-[40%] flex-col items-start justify-center rounded-2xl bg-white shadow-2xl"
	>
		<p class="mb-15 ml-12 text-left text-xl font-bold">Start your journey</p>
		<input
			type="text"
			bind:value={name}
			placeholder="Name"
			class="mx-auto mb-2 w-[80%] rounded-lg border border-gray-500 py-2 pl-4"
		/>
		<input
			type="email"
			bind:value={email}
			placeholder="Email"
			class="mx-auto mb-2 w-[80%] rounded-lg border border-gray-500 py-2 pl-4"
		/>
		<input
			type="password"
			bind:value={password}
			placeholder="Password"
			class="mx-auto mb-2 w-[80%] rounded-lg border border-gray-500 py-2 pl-4"
		/>
		<input
			type="password"
			bind:value={confirmPassword}
			placeholder="Confirm Password"
			class="mx-auto mb-2 w-[80%] rounded-lg border border-gray-500 py-2 pl-4"
		/>

		<button
			onclick={register}
			class="mx-auto mt-5 w-[80%] rounded-lg bg-gradient-to-r from-green-500 to-green-800 p-2 font-bold text-white transition duration-300 hover:scale-105 hover:from-green-800 hover:to-green-500"
			>Create my Account</button
		>

		<p class="mx-auto mt-2">___________________________________________________________</p>
		<a href="/" class="mx-auto mt-2 font-thin text-black">Already have an account?</a>
		<button
			onclick={handleLogin}
			class="mx-auto mt-5 w-[80%] rounded-lg bg-gradient-to-r from-green-500 to-green-800 p-2 font-bold text-white transition duration-300 hover:scale-105 hover:from-green-800 hover:to-green-500"
			>Log In</button
		>
	</div>
</div>
