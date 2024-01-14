import { isCallbackQueryUpdate, isMessageUpdate, isTextMessage, telegram } from './lib/telegram';
import * as linkify from 'linkifyjs';
import { titleOfUrl } from './lib/utils';
import * as Telegram from "@telegraf/types";
import * as Netlify from "@netlify/functions";

async function handleWebhook(data: Telegram.Update, botUrl?: string) {
  if (isMessageUpdate(data) && isTextMessage(data.message)) {
    if (data.message.text == '/info') {
      await telegram('sendMessage', {
        chat_id: data.message.chat.id,
        text: `Served from ${botUrl || "Unknown"}. WIP, not actually publishing anything`,
      });
    } else {
      const urls = linkify.find(data.message.text, 'url')
      for (const url of urls) {
        const title = await titleOfUrl(url.href);
        await telegram('sendMessage', {
          chat_id: data.message.chat.id,
          text: `Found link: <a href="${url.href}">${title}</a>. What do you want to do?`,
          parse_mode: 'HTML',
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

      if (urls.length === 0) {
        await telegram('sendMessage', {
          chat_id: data.message.chat.id,
          reply_parameters: { message_id: data.message.message_id },
          text: "No links in message. Can't do anything with that"
        });
      }
    }
  } else if (isCallbackQueryUpdate(data)) {
    try {
      await telegram('answerCallbackQuery', { callback_query_id: data.callback_query.id });
    } catch (err) {
      console.log(`Error answering callback query. Continuing: ${err}`)
    }

    const lastMessage = data.callback_query.message;
    if (lastMessage && isTextMessage(lastMessage) && lastMessage.entities && 'data' in data.callback_query) {
      const link = lastMessage.entities[0];
      if ('url' in link) {
        const url = link.url;
        const title = await titleOfUrl(url);
        var message: string;
        switch (data.callback_query.data) {
          case 'like': message = '❤️ Liked'; break;
          case 'bookmark': message = '🔖 Bookmarked'; break;
          default: message = 'X No action'; break;
        }
        await telegram('editMessageText', {
          chat_id: lastMessage.chat.id,
          message_id: lastMessage.message_id,
          text: message + ' <a href="' + url + '">' + title + '/a>',
          parse_mode: 'HTML'
        });
      } else {
        throw new Error("No link in originating message");
      }

    }
  }
}

export default async (req: Request, context: Netlify.Context) => {
  const secret_token = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
  if (secret_token !== process.env.BOT_SECRET_TOKEN) {
    throw new Error("Invalid secret token");
  }
  const data = (await req.json() as Telegram.Update);

  // Always return an ok response, just log errors when they happen.  Telegram
  // will keep sending the same request if we return an error, so this is to
  // prevent us from getting stuck in a loop
  try {
    await handleWebhook(data, context.site.url);
  } catch (error) {
    console.log("Error when running webhook:");
    console.log(error);
  } finally {
    return new Response();
  }
}
