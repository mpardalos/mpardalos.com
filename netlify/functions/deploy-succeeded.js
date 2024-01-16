import { telegram } from './lib/telegram';

const BOT_SECRET_TOKEN = process.env.BOT_SECRET_TOKEN;

export default async (req, context) => {
  const me = await telegram('getMe');
  console.log(`getMe: ${JSON.stringify(me)}`);
  console.log('---')

  const SITE_URL = process.env.BOT_SITE_URL || context.site.url;
  const WEBHOOK_URL = `${SITE_URL}/.netlify/functions/telegram-bot`
  console.log(`Setting webhook to ${WEBHOOK_URL}`)
  const webhook_response = await telegram('setWebhook', {
    url: WEBHOOK_URL,
    secret_token: BOT_SECRET_TOKEN
  });
  console.log(`Response: ${webhook_response}`);
  console.log('---')

  telegram('setMyCommands', {
    commands: [
      { command: 'info', description: 'Get info about the bot' },
      { command: 'help', description: 'How to use this bot' }
    ]
  })

  const webhook_info_response = await telegram('getWebhookInfo');
  console.log(`webhook info: ${JSON.stringify(webhook_info_response)}`);
  console.log('---')

  return new Response();
}
