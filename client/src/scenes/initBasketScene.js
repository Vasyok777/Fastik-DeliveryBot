const { Scenes } =  require("telegraf");
const {menu_btn} = require('../models/buttons');
const {User} = require('../api/controller/index');

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

initItemInBasketScene.hears(/(.+)/, async ctx => {
    const [info] = ctx.match.slice(1);
    let controller = new User();
    let data = await controller.getByUsername(ctx.chat.id);
    let busket = data.busket;
    if(String(info) != 'cancel'){
        busket.forEach(item => {
            if(item.amount === 0){
                item.amount = isNaN(Number(info)) != true ? Number(info) : 1
            }
        });
        await controller.updateUser(ctx.chat.id, {busket: busket});
        await ctx.reply( 'Інформацію оновлено успішно✅\nМожеш обрати щось іще додатково аби наповнити свій кошик новими товарами😊\nА якщо бажаєш оформити своє замовлення - натисни `Оформити📝` і оформлюй замовлення😉', {reply_markup:menu_btn});
        ctx.scene.leave('initBasket');
    }else if(String(info) === 'cancel'){
        await ctx.reply('Скасовано 😕❌', {reply_markup: menu_btn});
    }
})

initItemInBasketScene.leave(ctx => {
    console.log('Leave')
})

module.exports = initItemInBasketScene;