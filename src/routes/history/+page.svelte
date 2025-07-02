<script>
	import Sidenav from '../../components/Sidenav.svelte';

	// Simplified tab management
	const tabs = [
		{ id: 'expenses', label: 'Expense Logs' },
		{ id: 'budget-planner', label: 'Budget Logs' },
		{ id: 'payments', label: 'Payment Logs' }
	];
	let activeTab = $state(tabs[0].id);

	// Sample data for the square containers
	const items = [
		{ id: 1, title: 'Q1 Expenses', amount: '$2,450', change: '+12%' },
		{ id: 2, title: 'Q2 Expenses', amount: '$3,120', change: '-5%' },
		{ id: 3, title: 'Q3 Expenses', amount: '$2,800', change: '+8%' },
		{ id: 4, title: 'Food Budget', amount: '$1,200', change: '-3%' },
		{ id: 5, title: 'Travel Budget', amount: '$850', change: '+15%' },
		{ id: 6, title: 'Utilities', amount: '$620', change: '+2%' },
		{ id: 7, title: 'Jan Payments', amount: '$1,450', change: '0%' },
		{ id: 8, title: 'Feb Payments', amount: '$1,600', change: '+10%' },
		{ id: 9, title: 'Mar Payments', amount: '$1,550', change: '+5%' }
	];

	async function getAuthHeaders() {
		const token = localStorage.getItem('sessionToken');
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		};
	}
</script>

<div class="flex h-screen bg-gray-100">
	<!-- Sidenav -->
	<div class="h-full w-64 bg-white p-4 shadow-lg">
		<Sidenav />
	</div>

	<!-- Main content -->
	<div class="flex-1 overflow-auto p-6">
		<!-- Tab navigation -->
		<div class="mb-6 flex max-w-md gap-2 rounded-lg bg-gray-100 p-1">
			{#each tabs as tab}
				<button
					class="flex-1 rounded-md px-4 py-2 font-medium transition-colors duration-200"
					class:bg-white={activeTab === tab.id}
					class:text-gray-800={activeTab === tab.id}
					class:text-gray-500={activeTab !== tab.id}
					class:shadow-sm={activeTab === tab.id}
					onclick={() => (activeTab = tab.id)}
				>
					{tab.label}
				</button>
			{/each}
		</div>

		<!-- Content grid -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each items as item}
				<div class="flex aspect-square flex-col rounded-lg bg-white p-6 shadow">
					<h3 class="mb-2 text-lg font-semibold">{item.title}</h3>
					<div class="my-auto text-2xl font-bold">{item.amount}</div>
					<div class="mt-auto border-t border-gray-100 pt-2">
						<span
							class:bg-green-100={item.change.startsWith('+')}
							class:bg-red-100={item.change.startsWith('-')}
							class:bg-gray-100={item.change === '0%'}
							class:text-green-800={item.change.startsWith('+')}
							class:text-red-800={item.change.startsWith('-')}
							class:text-gray-800={item.change === '0%'}
							class="rounded-full px-2 py-1 text-sm font-medium"
						>
							{item.change}
						</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
