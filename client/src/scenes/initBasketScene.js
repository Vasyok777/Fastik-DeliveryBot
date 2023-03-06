const { Scenes } =  require("telegraf");
const {menu_btn} = require('../models/buttons');
const {User} = require('../api/controller/index');
const cmdList = require('../models/cmd.list.json');

const initItemInBasketScene = new Scenes.BaseScene('initBasket');

initItemInBasketScene.enter(async ctx => {
    await ctx.reply( 'Вкажи в якій кількості ти хочеш замовити');
})

initItemInBasketScene.on(/(.+)/, async ctx => {
    const [amount] = ctx.match.slice(1);
    let controller = new User();
    let data = await controller.getByUsername(ctx.chat.id);
    let busket = data.busket;
    console.log(Number(ctx.update.message.text));
    if(amount != cmdList.buttons.map(button => button.name)){
        busket.forEach(item => {
            if(item.amount === 0){
                item.amount = isNaN(Number(amount)) != true ? Number(amount) : 1
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