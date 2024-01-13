import telegram from './lib/telegram';

const SITE_URL = 'https://odin.elf-goblin.ts.net';
const WEBHOOK_URL = `${SITE_URL}/.netlify/functions/telegram-bot`
const BOT_SECRET_TOKEN = process.env.BOT_SECRET_TOKEN;

export default async (req, context) => {
  const me = await telegram('getMe');
  console.log(`getMe: ${JSON.stringify(me)}`);
  console.log('---')

  console.log(`Setting webhook to ${WEBHOOK_URL}`)
  const webhook_response = await telegram('setWebhook', {
    url: WEBHOOK_URL,
    secret_token: BOT_SECRET_TOKEN
  });
  console.log(`Response: ${webhook_response}`);
  console.log('---')

  const webhook_info_response = await telegram('getWebhookInfo');
  console.log(`webhook info: ${JSON.stringify(webhook_info_response)}`);
  console.log('---')

  return new Response();
}
