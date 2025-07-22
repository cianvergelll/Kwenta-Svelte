<script>
	import Sidenav from '../../components/Sidenav.svelte';
	import Card from '../../components/Card.svelte';
	import Icons from '../../components/Icons.svelte';
	import { onMount } from 'svelte';
	import Button from '../../components/Button.svelte';

	let status = 'Info';
	let timestamp = '2023-10-01 12:00:00';
	let NotificationSubject = 'Here is your monthly budget report and expense analysis';
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
		<div class="mx-auto my-2 w-[95%]">
			<div class="flex items-center rounded-xl bg-green-100 px-3 py-2 font-semibold">
				<span class="w-[150px] pl-8 text-green-600">Status</span>
				<span class="w-[200px] text-center text-green-800">Timestamp</span>
				<span class="flex-1 text-center text-green-800">Subject</span>
			</div>
		</div>
		<div class="mx-auto mb-2 w-[95%] space-y-3">
			<div class="flex items-center justify-between rounded-xl border bg-white px-3 py-2 shadow-sm">
				<div class="flex w-full items-center">
					<div class="flex w-[150px] items-center justify-start gap-1 pl-2 text-blue-600">
						<Icons variant="info" className="text-blue-600" />
						<span class="text-sm font-semibold uppercase">INFO</span>
					</div>
					<input
						type="text"
						value={timestamp}
						class="w-[200px] rounded-full border-none bg-white px-2 py-2 text-center text-sm outline-none"
						readonly
					/>
					<input
						type="text"
						value={NotificationSubject}
						class="flex-1 truncate rounded-full border-none bg-white px-2 py-2 text-center text-sm font-semibold outline-none"
						readonly
					/>

					<div class="flex w-1/6 justify-end">
						<!-- Edit -->
						<button aria-label="Edit" class="ml-2 text-gray-600 hover:text-gray-800">
							<Icons variant="check" />
						</button>
						<!-- Archive -->
						<button aria-label="Archive" class="ml-2 text-gray-600 hover:text-gray-800">
							<Icons variant="archive" />
						</button>
						<!-- Delete -->
						<button aria-label="Delete" class="ml-2 text-gray-600 hover:text-gray-800">
							<Icons variant="delete" />
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="mx-auto mb-2 w-[95%] space-y-3">
			<div class="flex items-center justify-between rounded-xl border bg-white px-3 py-2 shadow-sm">
				<div class="flex w-full items-center">
					<div class="flex w-[150px] items-center justify-start gap-1 pl-2 text-yellow-600">
						<Icons variant="warning" className="text-yellow-600" />
						<span class="text-sm font-semibold uppercase">WARNING</span>
					</div>
					<input
						type="text"
						value={timestamp}
						class="w-[200px] rounded-full border-none bg-white px-2 py-2 text-center text-sm outline-none"
						readonly
					/>
					<input
						type="text"
						value={NotificationSubject}
						class="flex-1 truncate rounded-full border-none bg-white px-2 py-2 text-center text-sm font-semibold outline-none"
						readonly
					/>
				</div>
				<div class="flex w-1/6 justify-end">
					<!-- Edit -->
					<button aria-label="Edit" class="ml-2 text-gray-600 hover:text-gray-800">
						<Icons variant="check" />
					</button>
					<!-- Archive -->
					<button aria-label="Archive" class="ml-2 text-gray-600 hover:text-gray-800">
						<Icons variant="archive" />
					</button>
					<!-- Delete -->
					<button aria-label="Delete" class="ml-2 text-gray-600 hover:text-gray-800">
						<Icons variant="delete" />
					</button>
				</div>
			</div>
		</div>

		<div class="mx-auto mb-2 w-[95%] space-y-3">
			<div class="flex items-center justify-between rounded-xl border bg-white px-3 py-2 shadow-sm">
				<div class="flex w-full items-center">
					<div class="flex w-[150px] items-center justify-start gap-1 pl-2 text-red-600">
						<Icons variant="error" className="text-red-600" />
						<span class="text-sm font-semibold uppercase">OVERSPENDING</span>
					</div>
					<input
						type="text"
						value={timestamp}
						class="w-[200px] rounded-full border-none bg-white px-2 py-2 text-center text-sm outline-none"
						readonly
					/>
					<input
						type="text"
						value={NotificationSubject}
						class="flex-1 truncate rounded-full border-none bg-white px-2 py-2 text-center text-sm font-semibold outline-none"
						readonly
					/>
				</div>
				<div class="flex w-1/6 justify-end">
					<!-- Edit -->
					<button aria-label="Edit" class="ml-2 text-gray-600 hover:text-gray-800">
						<Icons variant="check" />
					</button>
					<!-- Archive -->
					<button aria-label="Archive" class="ml-2 text-gray-600 hover:text-gray-800">
						<Icons variant="archive" />
					</button>
					<!-- Delete -->
					<button aria-label="Delete" class="ml-2 text-gray-600 hover:text-gray-800">
						<Icons variant="delete" />
					</button>
				</div>
			</div>
		</div>
	</Card>
</div>
