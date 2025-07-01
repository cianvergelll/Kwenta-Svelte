<script>
	let {
		ariaLabel = '',
		type = 'button',
		className = '',
		variant = 'primary',
		action = () => {},
		preventDefault = false
	} = $props();

	let classes = {
		primary:
			'rounded-lg bg-green-700 py-2 font-bold text-white transition duration-300 hover:bg-green-800',
		secondary:
			'rounded-lg bg-white py-2 font-bold text-green-800 transition duration-300 hover:bg-green-700 hover:text-white',
		danger:
			'rounded-lg bg-red-500 py-2 font-bold text-white transition duration-300 hover:bg-red-600',
		save: 'rounded-lg bg-blue-600 py-2 font-bold text-white transition duration-300 hover:bg-blue-700',
		update:
			'rounded-lg bg-purple-600 py-2 font-bold text-white transition duration-300 hover:bg-purple-700'
	};
</script>

<button
	{type}
	onclick={preventDefault
		? (e) => {
				e.preventDefault();
				action();
			}
		: action}
	class={`${classes[variant]} ${className}`}
	aria-label={ariaLabel}
	data-variant={variant}
>
	{#if variant === 'save'}
		Save
	{:else if variant === 'update'}
		Update
	{:else}
		Add Expense
	{/if}
</button>
