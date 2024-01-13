import telegram from './lib/telegram';

export default async (req, context) => {
  console.log("telegram-bot request");
  console.log(`Secret token: ${req.headers.get('X-Telegram-Bot-Api-Secret-Token')}`);
  const data = await req.json();
  console.log(`Request: ${JSON.stringify(data)}`);

  if (data.message) {
    console.log('---');

    const res = await telegram('sendMessage', {
      chat_id: data.message.chat.id,
      text: `ACK: ${data.message.text}`
    });
    console.log(res);
    console.log('---');
  }

  return new Response();
}
