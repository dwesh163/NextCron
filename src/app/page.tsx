'use client';

import { useState, useEffect, SVGProps } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/types/job';

export default function Home() {
	const [error, setError] = useState<string | null>(null);
	const [cronJobs, setCronJobs] = useState<Job[]>([]);
	const [newJob, setNewJob] = useState<Job>({
		name: '',
		command: '',
		schedule: '',
		emailNotification: false,
		id: 0,
		status: 'ready',
	});

	const fetchCronJobs = async () => {
		const response = await fetch('/api/cronjobs');
		if (response.ok) {
			const jobs = await response.json();
			if (jobs.error) {
				setError(jobs.error);
				return;
			}
			setCronJobs(jobs);
		}
	};

	useEffect(() => {
		fetchCronJobs();
		const interval = setInterval(() => {
			fetchCronJobs();
		}, 10000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	const handleCreateJob = async () => {
		const response = await fetch('/api/cronjobs', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(newJob),
		});

		if (response.ok) {
			const result = await response.json();
			setCronJobs([...cronJobs, result.job]);
			setNewJob({
				name: '',
				command: '',
				schedule: '',
				emailNotification: false,
				id: 0,
				status: 'running',
			});
		} else {
			const data = await response.json();
			setError(data.error);
		}
	};

	const handleEditJob = async (job: Job) => {
		const response = await fetch('/api/cronjobs', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(job),
		});

		if (response.ok) {
			const result = await response.json();
			setCronJobs(cronJobs.map((j) => (j.id === result.job.id ? result.job : j)));
		} else {
			const data = await response.json();
			setError(data.error);
		}
	};

	const handleDeleteJob = async (jobId: number) => {
		const response = await fetch(`/api/cronjobs?id=${jobId}`, {
			method: 'DELETE',
		});

		if (response.ok) {
			setCronJobs(cronJobs.filter((job) => job.id !== jobId));
		} else {
			console.error('Failed to delete job');
		}
	};

	return (
		<div className="flex flex-col h-screen">
			<header className="bg-primary text-primary-foreground py-4 px-6">
				<h1 className="text-2xl font-bold">NextCron</h1>
			</header>
			<main className="flex-1 p-6">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Create New Cron Job</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{error && <p className="text-red-500">{error}</p>}
								<div className="space-y-2">
									<Label htmlFor="name">Job Name</Label>
									<Input id="name" placeholder="Enter job name" value={newJob.name} onChange={(e) => setNewJob({ ...newJob, name: e.target.value })} />
								</div>
								<div className="space-y-2">
									<Label htmlFor="command">Command</Label>
									<Input id="command" placeholder="Enter command" value={newJob.command} onChange={(e) => setNewJob({ ...newJob, command: e.target.value })} />
								</div>
								<div className="space-y-2">
									<Label htmlFor="schedule">Schedule</Label>
									<Input id="schedule" placeholder="Enter cron schedule" value={newJob.schedule} onChange={(e) => setNewJob({ ...newJob, schedule: e.target.value })} />
								</div>
								<div className="flex justify-start items-center gap-2">
									<Checkbox id="emailNotification" checked={newJob.emailNotification} onCheckedChange={(checked: boolean) => setNewJob({ ...newJob, emailNotification: checked })} />
									<Label htmlFor="emailNotification">Email Notification</Label>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button onClick={handleCreateJob}>Create Job</Button>
						</CardFooter>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Cron Jobs</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Schedule</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody className="select-none">
									{cronJobs.map((job) => (
										<TableRow key={job.id}>
											<TableCell>{job.name}</TableCell>
											<TableCell>{job.schedule}</TableCell>
											<TableCell>
												<Badge variant="default" className={job.status === 'complete' ? 'bg-green-500 hover:bg-green-400 text-white' : job.status === 'running' ? 'bg-yellow-500 hover:bg-yellow-400 text-white' : job.status === 'ready' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-red-500 hover:bg-red-400 text-white'}>
													{job.status}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="icon"
														onClick={() => handleEditJob({ ...job, status: 'updated' })} // Example edit action
													>
														<FilePenIcon className="h-4 w-4" />
													</Button>
													<AlertDialog>
														<AlertDialogTrigger>
															<Button variant="outline" size="icon">
																<TrashIcon className="h-4 w-4" />
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
																<AlertDialogDescription>This action cannot be undone. This will permanently delete your account and remove your data from our servers.</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>Cancel</AlertDialogCancel>
																<AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => handleDeleteJob(job.id)}>
																	Continue
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}

function FilePenIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
			<path d="M14 2v4a2 2 0 0 0 2 2h4" />
			<path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
		</svg>
	);
}

function TrashIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M3 6h18" />
			<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
			<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
		</svg>
	);
}
