export type Job = {
	id: number;
	name: string;
	command: string;
	schedule: string;
	status: string;
	emailNotification: boolean;
};

export type NewJob = {
	name: number;
	command: string;
	schedule: string;
	emailNotification: boolean;
};
