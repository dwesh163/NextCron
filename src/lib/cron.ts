import { CronJob } from 'cron';
import fs from 'fs';
import path from 'path';
import { sendTelegramMessage } from './telegram';

const filePath = path.resolve(process.cwd(), 'data/cronjobs.json');
const scheduledJobs = new Map<number, CronJob>();

const readCronJobs = (): any[] => {
	try {
		const data = fs.readFileSync(filePath, 'utf8');
		return JSON.parse(data);
	} catch (err) {
		console.error(err);
		return [];
	}
};

const updateJobStatus = (id: string, status: string): void => {
	let cronJobs = readCronJobs();
	cronJobs = cronJobs.map((job) => (job.id === id ? { ...job, status } : job));
	fs.writeFileSync(filePath, JSON.stringify(cronJobs, null, 2));
};

const runCronJob = async (job: any) => {
	const jobId = job.id;

	updateJobStatus(jobId, 'running');

	try {
		await new Promise((resolve) => setTimeout(resolve, 3000));

		await sendTelegramMessage(`Cron Job:\nName: ${job.name}\nCommand: ${job.command}\nSchedule: ${job.schedule}`);

		updateJobStatus(jobId, 'complete');
	} catch (error) {
		updateJobStatus(jobId, 'failed');

		await sendTelegramMessage(`Cron Job Failed:\nName: ${job.name}\nCommand: ${job.command}\nSchedule: ${job.schedule}`);
	}
};

const scheduleCronJobs = () => {
	const cronJobs = readCronJobs();

	cronJobs.forEach((job) => {
		new CronJob(job.schedule, async () => {
			await runCronJob(job);
		}).start();
	});
};

const scheduleCronJob = (jobId: number) => {
	const cronJobs = readCronJobs();

	const job = cronJobs.find((job) => job.id === jobId);

	if (!job) {
		console.error('Job not found');
		return;
	}

	console.log('Scheduling job:', job);

	const cronJob = new CronJob(job.schedule, async () => {
		await runCronJob(job);
	});

	console.log('cronJob:', cronJob);

	scheduledJobs.set(jobId, cronJob);

	console.log(scheduledJobs);

	console.log('start1');
	cronJob.start();
	console.log('start 2');
	console.log('start 3');
};

console.log(scheduledJobs);

const deleteCronJob = (jobId: number) => {
	console.log(scheduledJobs);
	console.log('delete:', jobId);
	const cronJob = scheduledJobs.get(jobId);
	console.log('cronJob:', cronJob);

	if (cronJob) {
		cronJob.stop();
		scheduledJobs.delete(jobId);
	}
};

export { scheduleCronJob, deleteCronJob };
