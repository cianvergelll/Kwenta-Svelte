<script>
	let { variant = 'primary', className = '' } = $props();

	let classes = {
		primary: 'rounded-xl bg-gradient-to-r from-green-600 to-green-800 shadow-xl',
		secondary: 'flex-col items-center justify-center overflow-hidden rounded-xl bg-white shadow-xl'
	};
</script>

<!-- svelte-ignore slot_element_deprecated -->
<div class={`${classes[variant]} ${className}`}>
	<slot />
</div>
