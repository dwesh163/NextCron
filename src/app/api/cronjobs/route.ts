import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { deleteCronJob, scheduleCronJob } from '@/lib/cron';

const filePath = path.resolve(process.cwd(), 'data/cronjobs.json');

const readCronJobs = (): any[] => {
	try {
		const data = fs.readFileSync(filePath, 'utf8');
		return JSON.parse(data);
	} catch (err) {
		console.error('Error reading cron jobs:', err);
		return [];
	}
};

const writeCronJobs = (cronJobs: any[]): void => {
	try {
		fs.writeFileSync(filePath, JSON.stringify(cronJobs, null, 2));
	} catch (err) {
		console.error('Error writing cron jobs:', err);
	}
};

const getNextId = () => {
	try {
		let config = JSON.parse(fs.readFileSync('data/config.json', 'utf8'));
		config.id += 1;
		const id = config.id;
		fs.writeFileSync('data/config.json', JSON.stringify(config, null, 2));
		return id;
	} catch (err) {
		return 1;
	}
};

export async function GET() {
	const cronJobs = readCronJobs();
	return NextResponse.json(cronJobs);
}

export async function POST(request: Request) {
	let newJob = await request.json();
	if (!newJob.name || !newJob.command || !newJob.schedule) {
		return NextResponse.json({ error: 'Name, command, and schedule are required' }, { status: 400 });
	}

	const cronJobs = readCronJobs();
	newJob.id = getNextId();
	newJob.status = 'ready';
	cronJobs.push(newJob);
	writeCronJobs(cronJobs);

	scheduleCronJob(newJob.id);

	return NextResponse.json({ message: 'Job added successfully', job: newJob });
}

export async function DELETE(request: Request) {
	const url = new URL(request.url);
	const jobId = url.searchParams.get('id');
	if (!jobId) {
		return NextResponse.json({ message: 'Job ID is required' }, { status: 400 });
	}

	console.log(jobId);

	deleteCronJob(parseInt(jobId));

	let cronJobs = readCronJobs();
	cronJobs = cronJobs.filter((job) => job.id !== parseInt(jobId));

	console.log(cronJobs);
	writeCronJobs(cronJobs);

	return NextResponse.json({ message: 'Job deleted successfully' });
}

export async function PUT(request: Request) {
	const updatedJob = await request.json();
	let cronJobs = readCronJobs();
	cronJobs = cronJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job));
	writeCronJobs(cronJobs);

	return NextResponse.json({ message: 'Job updated successfully', job: updatedJob });
}
