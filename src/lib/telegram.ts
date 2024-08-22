import axios from 'axios';

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
const CHAT_ID = parseInt(process.env.CHAT_ID as string);

export async function sendTelegramMessage(message: string) {
	try {
		await axios.post(TELEGRAM_API_URL, {
			chat_id: CHAT_ID,
			text: message,
		});
	} catch (error) {
		throw new Error('Error sending message to Telegram:');
	}
}
