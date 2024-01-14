import { Telegraf } from "telegraf";
import * as linkify from 'linkifyjs';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!, {});
bot.start(ctx => ctx.reply("Welcome!"));
bot.help(ctx => ctx.reply("I am a WIP bot"));

bot.on('message', async ctx => {
  if ('text' in ctx.message) {
    const links = linkify.find(ctx.message.text, 'url')
    for (const link of links) {
      const target = link.href;
      if (JSON.stringify({ action: 'bookmark', target }).length > 64) {
        ctx.reply("Bot error. Link too long", {
          reply_to_message_id: ctx.message.message_id
        });
      } else {
        ctx.reply(`Found link: ${target}. What do you want to do?`, {
          reply_to_message_id: ctx.message.message_id,
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
    }
    if (links.length === 0) {
      ctx.reply("No links in message. Can't do anything with that", {
        reply_to_message_id: ctx.message.message_id
      });
    }
  }
});

bot.on('callback_query', async ctx => {
  console.log('Received callback query');
  if ('data' in ctx.callbackQuery) {
    const callback_data = JSON.parse(ctx.callbackQuery.data);
    if ('action' in callback_data && 'target' in callback_data) {
      ctx.answerCbQuery();
      switch (callback_data.action) {
        case 'like':
          await ctx.editMessageText(`❤️ Liked ${callback_data.target}`, {
            chat_id: ctx.callbackQuery.message?.chat.id,
            message_id: ctx.callbackQuery.message?.message_id
          });
          break;
        case 'bookmark':
          await ctx.editMessageText(`🔖 Bookmarked ${callback_data.target}`, {
            chat_id: ctx.callbackQuery.message?.chat.id,
            message_id: ctx.callbackQuery.message?.message_id
          });
          break;
        default:
          await ctx.editMessageText(`❌ No action on ${ callback_data.target }`, {
            chat_id: ctx.callbackQuery.message?.chat.id,
            message_id: ctx.callbackQuery.message?.message_id
          });
          break;
      }
    }
  }
})

export default async (req, context) => {
  console.log("telegram-bot request");
  const secret_token = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
  if (secret_token !== process.env.BOT_SECRET_TOKEN) {
    console.log("Invalid secret token");
  } else {
    const update = await req.json();
    console.log(update);
    bot.handleUpdate(update);
  }
}
