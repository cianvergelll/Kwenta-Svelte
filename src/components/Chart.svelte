<script lang="ts">
	import ChartJS from 'chart.js/auto';
	import type { ChartConfiguration, ChartTypeRegistry } from 'chart.js';
	import { onMount } from 'svelte';

	type ValidChartType = 'bar' | 'pie' | 'doughnut' | 'line';

	interface Props {
		title: string;
		chartLabels: string[];
		chartData: number[];
		dataLabel?: string;
		chartType?: ValidChartType;
		onReload?: () => void;
	}

	let {
		title = 'Expense Chart',
		chartLabels = [],
		chartData = [],
		dataLabel = 'Amount',
		chartType = 'bar',
		onReload
	} = $props();

	let canvas: HTMLCanvasElement | null = $state(null);
	let chart: ChartJS | null = $state(null);

	// Color scheme matching your expense categories
	const categoryColors: Record<string, string> = {
		food: 'rgba(236, 72, 153, 0.7)', // Pink
		transportation: 'rgba(245, 158, 11, 0.7)', // Yellow
		utilities: 'rgba(59, 130, 246, 0.7)', // Blue
		entertainment: 'rgba(139, 92, 246, 0.7)', // Purple
		other: 'rgba(156, 163, 175, 0.7)' // Gray
	};

	const getBackgroundColors = (labels: string[]) => {
		return labels.map((label) => categoryColors[label.toLowerCase()] || 'rgba(75, 192, 192, 0.7)');
	};

	const createChart = () => {
		if (!canvas) return;

		// Create copies of the arrays to avoid modifying the $state arrays directly
		const labelsCopy = [...chartLabels];
		const dataCopy = [...chartData];

		const config: ChartConfiguration = {
			type: chartType as keyof ChartTypeRegistry,
			data: {
				labels: labelsCopy,
				datasets: [
					{
						label: dataLabel,
						data: dataCopy,
						backgroundColor: getBackgroundColors(labelsCopy),
						borderColor: getBackgroundColors(labelsCopy).map((color) => color.replace('0.7', '1')),
						borderWidth: 1
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					legend: {
						position: 'top'
					},
					tooltip: {
						callbacks: {
							label: (context) => {
								return `₱${
									typeof context.parsed.y === 'number'
										? context.parsed.y.toFixed(2)
										: typeof context.raw === 'number'
											? context.raw.toFixed(2)
											: '0.00'
								}`;
							}
						}
					}
				},
				scales:
					chartType === 'bar' || chartType === 'line'
						? {
								y: {
									beginAtZero: true,
									ticks: {
										callback: (value) => `₱${value}`
									}
								}
							}
						: undefined
			}
		};

		chart = new ChartJS(canvas, config);
	};

	onMount(() => {
		createChart();
	});

	$effect(() => {
		if (chart) {
			// Create copies of the arrays before updating the chart
			const labelsCopy = [...chartLabels];
			const dataCopy = [...chartData];

			chart.data.labels = labelsCopy;
			chart.data.datasets[0].data = dataCopy;
			chart.data.datasets[0].backgroundColor = getBackgroundColors(labelsCopy);
			chart.data.datasets[0].borderColor = getBackgroundColors(labelsCopy).map((color) =>
				color.replace('0.7', '1')
			);
			chart.update();
		}
	});

	$effect(() => {
		if (chart && chartType !== (chart.config as ChartConfiguration).type) {
			chart.destroy();
			createChart();
		}
	});
</script>

<div class="rounded-xl bg-white p-10">
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-xl font-semibold text-green-700">{title}</h2>
		<!-- {#if onReload}
			<button
				onclick={onReload}
				class="rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
				aria-label="Reload chart"
			>
				Reload
			</button>
		{/if} -->
	</div>

	<div class="h-64 w-full border border-gray-300">
		<canvas bind:this={canvas}></canvas>
	</div>
</div>
