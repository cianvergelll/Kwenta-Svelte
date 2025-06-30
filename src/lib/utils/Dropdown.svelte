<script>
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	export let options = [];
	export let selectedValue;
	export let disabled = false;
	export let label = '';
	export let name = '';
	export let className = '';
	export let onSelect = (value) => {};

	let isOpen = false;
	let dropdownRef;

	function handleSelect(value) {
		selectedValue = value;
		onSelect(value);
		isOpen = false;
	}

	function handleClickOutside(event) {
		if (dropdownRef && !dropdownRef.contains(event.target)) {
			isOpen = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="relative w-full {className}" bind:this={dropdownRef}>
	{#if label}
		<label for={name} class="mb-1 block pl-1 text-sm text-gray-600">
			{label}
		</label>
	{/if}

	<button
		id={name}
		on:click|preventDefault={() => !disabled && (isOpen = !isOpen)}
		class:opacity-70={disabled}
		class:pointer-events-none={disabled}
		class="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white p-2 text-left disabled:bg-gray-100"
		{disabled}
	>
		<span class="truncate">
			{options.find((opt) => opt.value === selectedValue)?.label || 'Select an option'}
		</span>
		<svg
			class={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if isOpen}
		<div
			transition:fade
			class="absolute z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg"
		>
			<ul class="max-h-60 overflow-auto py-1">
				{#each options as option (option.value)}
					<li>
						<button
							type="button"
							on:click|preventDefault={() => handleSelect(option.value)}
							class="w-full cursor-pointer px-3 py-2 text-left hover:bg-gray-100"
							class:bg-blue-50={selectedValue === option.value}
						>
							{option.label}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
