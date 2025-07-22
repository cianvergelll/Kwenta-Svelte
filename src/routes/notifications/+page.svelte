<script>
	import Sidenav from '../../components/Sidenav.svelte';
	import Card from '../../components/Card.svelte';
	import Icons from '../../components/Icons.svelte';
	import { onMount } from 'svelte';
	import Button from '../../components/Button.svelte';
</script>

<div class="flex h-screen w-screen items-center justify-start bg-gray-100">
	<div class="ml-5 flex h-[95%] w-1/5 flex-col rounded-xl shadow-lg">
		<Sidenav />
	</div>

	<Card variant="secondary" className="h-[95%] w-[75%] mx-auto">
		<h2
			class="py- mx-auto mt-5 flex w-[95%] items-center justify-center rounded-md bg-gradient-to-r from-green-500 to-green-700 py-2 text-center text-lg font-semibold tracking-wide text-white"
		>
			NOTIFICATIONS
		</h2>
		<div class="mt-5 flex w-full flex-row justify-center space-x-2">
			<Button
				variant="secondary"
				action="unread-notifications"
				ariaLabel="Unread Notifications"
				className="w-[20%] rounded-lg border border-gray-300 bg-white shadow-lg flex items-center justify-center gap-2 py-2"
				><Icons variant="envelope" /></Button
			>
			<Button
				variant="secondary"
				action="read-notifications"
				ariaLabel="Read Notifications"
				className="w-[18%] rounded-lg border border-gray-300 bg-white shadow-lg flex items-center justify-center gap-2 py-2 mr-115"
			>
				<Icons variant="envelope-open" />
			</Button>
			<Button
				variant="secondary"
				action="mark-all-read"
				ariaLabel="Mark all as read"
				className="w-[15%] rounded-lg border border-gray-300 bg-white shadow-lg flex items-center justify-center gap-2 py-2"
				><Icons variant="check" /></Button
			>
		</div>
	</Card>
</div>
