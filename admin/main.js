const { Telegraf } =  require("telegraf");
require('dotenv').config()

const {Auth} = require('./src/api/controller/index');
const {courier_menu_btn, admin_menu_btn} = require('./src/models/buttons');
const readButtonCommands = require('./src/commands/buttonCommands');
const readActionCommands = require('./src/commands/actionCommands');
const bot = new Telegraf(process.env.TOKEN);


bot.start(async (ctx) => {
    let lvl = await Auth.login(ctx.chat.id);
    lvl === 1 ? 
        await ctx.reply(`Вітаю, ${ctx.chat.first_name}🤗\nЛаскаво просимо вас в Кур'єр-Панель системи 'Fastik'. Оберіть пункт з меню через який ви бажаєте працювати із системою😊`, {reply_markup: courier_menu_btn}) : 
        lvl === 2 ? 
            await ctx.reply(`Вітаю, ${ctx.chat.first_name}🤗\nЛаскаво просимо вас в Адмін-Панель системи 'Fastik'. Оберіть пункт з меню через який ви бажаєте працювати із системою😊`, {reply_markup: admin_menu_btn}) : 
                await ctx.reply('Упс...😕\nСхоже ви не маєте прав доступу до системи. Якщо бажаєте стати частинкою нашої команди натискай "Хочу в команду 🙋" і передай необхідні дані адміністрації 😉', {
                    reply_markup:{
                        keyboard:[
                            ["Хочу в команду 🙋"],
                        ],
                        resize_keyboard: true, 
                        is_persistent: true
                    }
                })
});

readButtonCommands(bot);
readActionCommands(bot);

bot.launch();