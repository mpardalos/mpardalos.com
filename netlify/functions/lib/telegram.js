const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export default async (method, args) => {
  console.log(`Telegram request: ${method}(${JSON.stringify(args)})`)
  const response = args
    ? await fetch(`${BOT_API_URL}/${method}`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    })
    : await fetch(`${BOT_API_URL}/${method}`)
  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Telegram bot API error: ${data.description}`);
  }
  return data.result;
}
