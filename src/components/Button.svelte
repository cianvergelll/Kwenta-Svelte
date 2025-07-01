<script>
	let {
		ariaLabel = '',
		type = 'button',
		className = '',
		variant = 'primary',
		action = () => {}
	} = $props();

	let classes = {
		primary: 'bg-blue-500 hover:bg-blue-600 text-white',
		secondary: 'bg-gray-500 hover:bg-gray-600 text-white'
	};
</script>

<button onclick={action} class={className} aria-label={ariaLabel} data-variant={variant}> </button>
