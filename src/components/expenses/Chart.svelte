<script lang="ts">
  import ChartJS from 'chart.js/auto';
  import type { ChartConfiguration, ChartTypeRegistry } from 'chart.js';
  import { onMount, onDestroy } from 'svelte';

  type ValidChartType = 'bar' | 'pie' | 'doughnut' | 'line';
  type Timeframe = 'daily' | 'monthly';

  interface Expense {
    created_at?: string;
    date?: string;
    expense_category: string;
    expense_amount: string | number;
  }

  interface Props {
    title: string;
    expenses: Expense[];
    timeframe: Timeframe;
    dataLabel?: string;
    chartType?: ValidChartType;
  }

  let {
    title = 'Expense Chart',
    expenses = [],
    timeframe = 'monthly',
    dataLabel = 'Amount',
    chartType = 'bar'
  } = $props();

  let canvas: HTMLCanvasElement | null = $state(null);
  let chart: ChartJS | null = $state(null);

  const categoryColors: Record<string, string> = {
    food: 'rgba(236, 72, 153, 0.7)',
    transportation: 'rgba(245, 158, 11, 0.7)',
    utilities: 'rgba(59, 130, 246, 0.7)',
    entertainment: 'rgba(139, 92, 246, 0.7)',
    other: 'rgba(156, 163, 175, 0.7)',
    bills: 'rgba(34, 197, 94, 0.7)'
  };

  const getFilteredExpenses = () => {
    const now = new Date();
    if (timeframe === 'daily') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return expenses.filter((expense) => {
        const expenseDate = new Date(expense.created_at || expense.date);
        return expenseDate >= today;
      });
    } else {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      return expenses.filter((expense) => {
        const expenseDate = new Date(expense.created_at || expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      });
    }
  };

  const processChartData = () => {
    const filteredExpenses = getFilteredExpenses();
    const categoryMap: Record<string, number> = {};

    filteredExpenses.forEach((expense) => {
      const category = expense.expense_category;
      const amount = parseFloat(expense.expense_amount.toString());
      if (!isNaN(amount)) {
        categoryMap[category] = (categoryMap[category] || 0) + amount;
      }
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
                const value = typeof context.parsed.y === 'number' ? context.parsed.y : context.raw;
                return `₱${(value as number)?.toFixed(2) || '0.00'}`;
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

  onDestroy(() => {
    if (chart) {
      chart.destroy();
    }
  });

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