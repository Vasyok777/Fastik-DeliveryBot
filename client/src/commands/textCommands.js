const {menu_btn} = require('../models/buttons');
const {User, Auth} = require('../api/controller/index');
  

function readCommandsText(bot){
    bot.command('start', async (ctx) => {
        console.log(ctx.chat);
        let Users = new User();
        let user = await Users.getByUsername(ctx.chat.username);
        if(user === undefined){
            await Auth.register(ctx.chat.username);
            await ctx.reply('Привіт!🤗\nВітаю, друже😊. Радий тебе бачити тут😉');
            await ctx.reply('Бачу ти у нас вперше і ми про тебе мало що знаємо😕\nЩо ж давай це виправимо😉\nСпершу я представлю себе, а потім перейжемо до тебе😊\nМене звуть Fastik, я бот який допоможе тобі замовити те, що ти бажаєш, неважливо, чи це ніч, чи це день. Я надаю тобі усі можливості, які допоможуть тобі все замовити в декілька кліків і швиденько отримати своє замовлення. Тепер давай дізнаємось про тебе дещо🤗');
            await ctx.scene.enter('setNumber');
        }else{
            await ctx.reply('Привіт!🤗\nВітаю, друже😊. Радий тебе бачити тут😉');
            if(user.pnumber === ""){
                await ctx.reply('Бачу, щось пішло не так коли ти вводив свій номер телефону😕\nЩо ж давай це виправимо😉');
                await ctx.scene.enter('setNumber');
            }else if(user.client_name === ""){
                await ctx.reply('Бачу ти не вказав своє ім\'я😕\nЩо ж давай це виправимо😉');
                await ctx.scene.enter('setName');
            }else{
                await ctx.reply('Обери пункт у меню який тобі до вподоби, щоби продовжити користування системою😌', {reply_markup: menu_btn});
            }
        }
    }); 
}

module.exports = readCommandsText;