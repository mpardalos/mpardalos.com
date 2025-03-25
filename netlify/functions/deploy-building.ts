import { telegram } from "./lib/telegram";

const NOTIFY_CHAT_ID = process.env.NOTIFY_CHAT_ID;

export default async (req, context) => {
    console.log("Sending notification");
    await telegram('sendMessage', {
      chat_id: NOTIFY_CHAT_ID,
      text: `Deploy building`,
    });
}
