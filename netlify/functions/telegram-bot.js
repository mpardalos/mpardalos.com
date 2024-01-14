import telegram from './lib/telegram';
import * as linkify from 'linkifyjs';

export default async (req, context) => {
  console.log("telegram-bot request");
  const secret_token = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
  if (secret_token !== process.env.BOT_SECRET_TOKEN) {
    throw new Error("Invalid secret token");
  }
  const data = await req.json();

  if (data.message) {
    console.log("Received message");
    console.log(data.message);

    const links = linkify.find(data.message.text, 'url')
    for (const link of links) {
      const target = link.href;
      await telegram('sendMessage', {
        chat_id: data.message.chat.id,
        text: `Found link: ${target}. What do you want to do?`,
        reply_parameters: { message_id: data.message.message_id },
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Like", callback_data: JSON.stringify({ action: 'like', target }) },
              { text: "Bookmark", callback_data: JSON.stringify({ action: 'bookmark', target }) },
              { text: "Cancel", callback_data: JSON.stringify({ action: 'cancel', target }) },
            ]
          ]
        }
      });
    }
    if (links.length === 0) {
      await telegram('sendMessage', {
        chat_id: data.message.chat.id,
        reply_parameters: { message_id: data.message.message_id },
        text: "No links in message. Can't do anything with that"
      });
    }
    console.log('---');
  } else if (data.callback_query) {
    console.log('Received callback query');
    console.log(data.callback_query);
    const callback_data = JSON.parse(data.callback_query.data);

    try {
      await telegram('answerCallbackQuery', { callback_query_id: data.callback_query.id });
    } catch (err) {
      console.log(`Error answering callback query. Continuing: ${err}`)
    }

    switch (callback_data.action) {
      case 'like':
        await telegram('editMessageText', {
          chat_id: data.callback_query.message.chat.id,
          message_id: data.callback_query.message.message_id,
          text: `❤️ Liked ${callback_data.target}`
        });
        break;
      case 'bookmark':
        await telegram('editMessageText', {
          chat_id: data.callback_query.message.chat.id,
          message_id: data.callback_query.message.message_id,
          text: `🔖 Bookmarked ${callback_data.target}`,
        });
        break;
      default:
        await telegram('editMessageText', {
          chat_id: data.callback_query.message.chat.id,
          message_id: data.callback_query.message.message_id,
          text: `❌ No action on ${callback_data.target}`,
        });
        break;
    }
    console.log('---');
  } else {
    console.log("Received request");
    console.log(data)
    console.log('---');
  }

  return new Response();
}
