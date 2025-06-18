<script>
	import SideNav from '../../components/Sidenav.svelte';
	const inputStyle = 'w-[90%] py-2 rounded-lg pl-4 mb-2 placeholder:text-gray-400';
</script>

<div class="flex h-screen w-screen items-center justify-start bg-gray-100">
	<div class="ml-5 flex h-[95%] w-1/5 flex-col rounded-xl shadow-lg">
		<SideNav />
	</div>

	<div class="mx-auto flex h-[95%] w-[35%] flex-col rounded-lg border border-gray-300 bg-white">
		<label class="text-m mb-2 self-start pl-[5%]" for="budget-planner"
			>Enter you monthly budget</label
		>
		<input
			id="total-budget"
			type="number"
			placeholder="₱ 00.00"
			class={`${inputStyle} mx-auto border border-gray-800 bg-transparent text-center text-3xl font-bold text-gray-900 placeholder:text-3xl placeholder:font-bold`}
			required
		/>
	</div>
	<div class="mr-5 h-[95%] w-[40%] rounded-lg border border-gray-300 bg-white"></div>
</div>
