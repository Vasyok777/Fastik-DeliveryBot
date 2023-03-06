const { Scenes } =  require("telegraf");
const {menu_btn} = require('../models/buttons');
const {User} = require('../api/controller/index');
const cmdList = require('../models/cmd.list.json');

const initItemInBasketScene = new Scenes.BaseScene('initBasket');

initItemInBasketScene.enter(async ctx => {
    await ctx.reply( 'Вкажи в якій кількості ти хочеш замовити', {reply_markup:{
        inline_keyboard: [
            [
                {text: 'Скасувати ❌', callback_data: 'cancel'}
            ]
        ],
        resize_keyboard: true,
    }});
})

initItemInBasketScene.hears('cancel', async ctx => {
    await ctx.reply('Скасовано 😕❌', {reply_markup: menu_btn});
    ctx.scene.leave('initBasket');
})

initItemInBasketScene.on('text', async ctx => {
    let controller = new User();
    let data = await controller.getByUsername(ctx.chat.id);
    let busket = data.busket;
    console.log(Number(ctx.update.message.text));
    if(ctx.update.message.text != cmdList.buttons.map(button => button.name)){
        busket.forEach(item => {
            if(item.amount === 0){
                item.amount = isNaN(Number(ctx.update.message.text)) != true ? Number(ctx.update.message.text) : 1
            }
        });
        await controller.updateUser(ctx.chat.id, {busket: busket});
        await ctx.reply( 'Інформацію оновлено успішно✅\nМожеш обрати щось іще додатково аби наповнити свій кошик новими товарами😊\nА якщо бажаєш оформити своє замовлення - натисни `Оформити📝` і оформлюй замовлення😉', {reply_markup:menu_btn});
        ctx.scene.leave('initBasket');
    }
})

initItemInBasketScene.leave(ctx => {
    console.log('Leave')
})

module.exports = initItemInBasketScene;