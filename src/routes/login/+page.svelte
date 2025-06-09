<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	let email = '';
	let password = '';
	let error = '';

	// If already logged in, redirect to dashboard
	onMount(async () => {
		const token = localStorage.getItem('sessionToken');
		if (token) {
			try {
				const res = await fetch('/api/auth/verify', {
					headers: { Authorization: `Bearer ${token}` }
				});
				if (res.ok) {
					goto('/home');
				}
			} catch (error) {
				console.error('Session verification failed:', error);
			}
		}
	});

	async function handleLogin() {
		error = '';
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			if (response.ok) {
				const data = await response.json();
				console.log('Login response:', data);
				localStorage.setItem('sessionToken', data.token);
				goto('/home');
			} else {
				const err = await response.json();
				error = err.error || 'Login failed';
			}
		} catch (err) {
			console.error('Login error:', err); // Debug log
			error = 'Network error';
		}
	}

	function handleRegister() {
		goto('/register');
	}
</script>

<title>Kwenta</title>
<div class="flex h-screen w-screen items-center justify-center bg-gray-100">
	<div class="flex h-screen w-[70%] flex-col items-start justify-center">
		<p
			class="mb-5 bg-gradient-to-tr from-green-600 to-green-800 bg-clip-text pl-40 text-7xl font-bold text-transparent"
		>
			Kwenta
		</p>
		<p class="pl-40 text-xl">
			Stay on track of your daily business and personal finances, <br />See where your money goes.
		</p>
	</div>

	<div
		class="mr-40 flex h-[70%] w-[40%] flex-col items-start justify-center rounded-2xl bg-white shadow-2xl"
	>
		<p class="mb-15 ml-12 text-left text-xl font-bold">Log in to your account</p>
		<input
			type="email"
			placeholder="Email"
			class="mx-auto mb-2 w-[80%] rounded-lg border border-gray-500 py-2 pl-4"
			required
		/>
		<input
			type="password"
			placeholder="Password"
			class="mx-auto mb-2 w-[80%] rounded-lg border border-gray-500 py-2 pl-4"
			required
		/>

		<button
			class="mx-auto mt-5 w-[80%] rounded-lg bg-gradient-to-r from-green-500 to-green-800 p-2 font-bold text-white transition duration-300 hover:scale-105 hover:from-green-800 hover:to-green-500"
			>Log In</button
		>
		<a href="/" class="mx-auto mt-2 font-thin text-black">Forgot password?</a>

		<p class="mx-auto">___________________________________________________________</p>
		<button
			onclick={handleRegister}
			class="mx-auto mt-5 w-[80%] rounded-lg bg-gradient-to-r from-green-500 to-green-800 p-2 font-bold text-white transition duration-300 hover:scale-105 hover:from-green-800 hover:to-green-500"
			>Create an Account</button
		>
	</div>
</div>
