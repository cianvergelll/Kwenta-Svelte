<script lang="ts">
	import Chart from 'chart.js/auto';

	let { title, chartLabels, chartData, dataLabel, onReload } = $props();

	let canvas: HTMLCanvasElement | null = $state(null);
	let chart: Chart | null = $state(null);
</script>

<div>
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-xl font-semibold">{title}</h2>
		<button onclick={onReload} class="btn btn-primary" aria-label="Reload"></button>
	</div>
</div>
