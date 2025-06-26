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
		expenses?: any[]; // Add expenses prop to filter by month
	}

	let {
		title = 'Expense Chart',
		chartLabels = [],
		chartData = [],
		dataLabel = 'Amount',
		chartType = 'bar',
		onReload,
		expenses = [] // Initialize with empty array
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

	// ======= NEW: Filter expenses to current month ========
	const getCurrentMonthExpenses = () => {
		const now = new Date();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();

		return expenses.filter((expense) => {
			const expenseDate = new Date(expense.created_at || expense.date);
			return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
		});
	};

	// ======= MODIFIED: Process only current month's data ========
	const processChartData = () => {
		const currentMonthExpenses = getCurrentMonthExpenses();
		const categoryMap: Record<string, number> = {};

		currentMonthExpenses.forEach((expense) => {
			const category = expense.expense_category;
			const amount = parseFloat(expense.expense_amount);

			if (!categoryMap[category]) {
				categoryMap[category] = 0;
			}
			categoryMap[category] += amount;
		});

		return {
			labels: Object.keys(categoryMap),
			data: Object.values(categoryMap)
		};
	};

	const getBackgroundColors = (labels: string[]) => {
		return labels.map((label) => categoryColors[label.toLowerCase()] || 'rgba(75, 192, 192, 0.7)');
	};

	const createChart = () => {
		if (!canvas) return;

		// Use processed current month data
		const { labels, data } = processChartData();

		const config: ChartConfiguration = {
			type: chartType as keyof ChartTypeRegistry,
			data: {
				labels,
				datasets: [
					{
						label: dataLabel,
						data,
						backgroundColor: getBackgroundColors(labels),
						borderColor: getBackgroundColors(labels).map((color) => color.replace('0.7', '1')),
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

	// ======= MODIFIED: Update with current month data ========
	$effect(() => {
		if (chart) {
			const { labels, data } = processChartData();
			chart.data.labels = labels;
			chart.data.datasets[0].data = data;
			chart.data.datasets[0].backgroundColor = getBackgroundColors(labels);
			chart.data.datasets[0].borderColor = getBackgroundColors(labels).map((color) =>
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
	</div>

	<div class="h-64 w-full border border-gray-300">
		<canvas bind:this={canvas}></canvas>
	</div>
</div>
