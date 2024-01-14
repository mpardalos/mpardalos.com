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

    if (data.message.text == '/info') {
      telegram('sendMessage', {
        chat_id: data.message.chat.id,
        text: `Served from ${context.site.url}. WIP, not actually publishing anything`,
      });
    } else {
      const links = linkify.find(data.message.text, 'url')
      for (const link of links) {
        await telegram('sendMessage', {
          chat_id: data.message.chat.id,
          text: `Found link: ${link.href}. What do you want to do?`,
          reply_parameters: { message_id: data.message.message_id },
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Like", callback_data: 'like' },
                { text: "Bookmark", callback_data: 'bookmark' },
                { text: "Cancel", callback_data: 'cancel' },
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
    }
    console.log('---');
  } else if (data.callback_query) {
    console.log('Received callback query');
    console.log(data.callback_query);

    try {
      await telegram('answerCallbackQuery', { callback_query_id: data.callback_query.id });
    } catch (err) {
      console.log(`Error answering callback query. Continuing: ${err}`)
    }

    if (data.callback_query.message.date == 0) {
      // Inaccessible message
      await telegram('sendMessage', {
        chat_id: data.callback_query.message.chat.id,
        message_id: data.callback_query.message.message_id,
        text: 'Message is inaccessible'
      })
    } else {
      const link = linkify.find(data.callback_query.message.text, 'url')[0].href;
      if (link) {
        var message;
        switch (data.callback_query.data) {
          case 'like': message = `❤️ Liked ${link}`; break;
          case 'bookmark': message = `🔖 Bookmarked ${link}`; break;
          default: message = `X No action on ${link} `; break;
        }
        await telegram('editMessageText', {
          chat_id: data.callback_query.message.chat.id,
          message_id: data.callback_query.message.message_id,
          text: message,
        });
      }
    }

    console.log('---');
  } else {
    console.log("Received request");
    console.log(data)
    console.log('---');
  }

  return new Response();
}
