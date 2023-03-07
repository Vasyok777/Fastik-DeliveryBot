const Telegraf = require('telegraf');
const {menu_btn,rest_menu_btn,shop_menu_btn,tomain_inline_btn,busket_menu_btn,} = require('../models/buttons');
const shopList = require('../../../MenuDB/shops.json');
const restList = require('../../../MenuDB/restaurant.json');
const {User, Ticket} = require('../api/controller/index');
const {getAdress} = require('./inputCommands');
const cmdList = require('../models/cmd.list.json');

let numberOfTicketInList = 0;
let userTickets = [];
let list = "";

function countSum(list){
    let sum = 0;
    list.forEach((el) => {
        sum += (el.price * el.amount);
    });
    return sum;
}

function getProductsKeyboard(shopArray, type) {
    return Telegraf.Markup.inlineKeyboard(
        shopArray.products.map((item) => {
            return [Telegraf.Markup.button.callback(`${item.name} - ${item.price} грн.`, `get_${type}_${shopArray.id}_${item.id}`)];
        })
    );
}

function getShopsKeyboard() {
    return Telegraf.Markup.inlineKeyboard(
        shopList.shops.map((item) => {
            return [Telegraf.Markup.button.callback(`${item.name}`, `get_products_shop_${item.id}`)];
        })
    );
}

function getRestsKeyboard() {
    return Telegraf.Markup.inlineKeyboard(
        restList.shops.map((item) => {
            return [Telegraf.Markup.button.callback(`${item.name}`, `get_products_rest_${item.id}`)];
        })
    );
}

function readCommandsButton(bot){

    bot.action(/get_products_(.+)_(.+)/, (ctx) => {
        const [type, id] = ctx.match.slice(1);
        if(type === "shop"){
            const shop = shopList.shops.find(shop => shop.id === Number(id));
            console.log(shop);
            ctx.reply(`Обери товари з даного списку що знаходиться під даним повідомленням😌`, getProductsKeyboard(shop, type));
        }else if(type === "rest"){
            const shop = restList.shops.find(shop => shop.id === Number(id));
            console.log(shop);
            ctx.reply(`Обери товари з даного списку що знаходиться під даним повідомленням😌`, getProductsKeyboard(shop, type));
        }
    });
    bot.action('previous', async (ctx) => {
        await ctx.deleteMessage();
        let tickets = new Ticket();
        let Users = new User();
        let user = await Users.getByUsername(ctx.chat.id);
        let userTickets = await tickets.getByUsername(`${user.client_name}%20-%20${ctx.chat.id}`);
        if(numberOfTicketInList+1 < 1){
            numberOfTicketInList = 0;
        }else{
            --numberOfTicketInList;
        }
        list = "";
        list = "";
        if(userTickets.length != 0 || userTickets === undefined){
            let i = 0;
            userTickets[numberOfTicketInList].itemlist.forEach(el => {
                list += `${++i}) ${el.name} - ${el.price} grn (${el.amount} шт)\n`;
            })
            let courier = "";
            if(userTickets[numberOfTicketInList].courier != ""){
                let cour_arr = userTickets[numberOfTicketInList].courier.split('(');
                let final_res = cour_arr[1].split(')')
                courier = final_res[0];
            }else{
                courier = "В очікуванні на кур'єра ⌛"
            }
            await ctx.reply(`Дата замовлення: ${userTickets[numberOfTicketInList].date}\n\nСписок замовлених товарів:\n\n${list}\n\nКур'єр: ${courier}\n\nЗагальна ціна: ${userTickets[numberOfTicketInList].tPrice} грн💸\n\nСтатус замовлення: ${userTickets[numberOfTicketInList].status === 0 ? 'Складаємо замовлення ⌛' : userTickets[numberOfTicketInList].status === 1 ? 'Курєр забрав замовлення 🚗' : 'Доставлено ✅'}`,
                {
                    reply_markup: {
                        inline_keyboard: numberOfTicketInList != 0 ? [
                            [
                                {text: "◀️", callback_data: "previous"},
                                {text: "▶️", callback_data: "next"}
                            ],
                            [
                                {text: 'Залишити відгук', callback_data: `send_comment_${userTickets[numberOfTicketInList]._id}`}
                            ]
                        ] : [
                            [
                                {text: "▶️", callback_data: "next"}
                            ],
                            [
                                {text: 'Залишити відгук', callback_data: `send_comment_${userTickets[numberOfTicketInList]._id}`}
                            ]
                        ],
                        resize_keyboard: true
                    }
                }
            );
        }
    });
    bot.action('next', async (ctx) => {
        await ctx.deleteMessage();
        let tickets = new Ticket();
        let Users = new User();
        let user = await Users.getByUsername(ctx.chat.id);
        let userTickets = await tickets.getByUsername(`${user.client_name}%20-%20${ctx.chat.id}`);
        if(userTickets.length <= numberOfTicketInList+1){
            numberOfTicketInList = userTickets.length - 1;
        }else ++numberOfTicketInList;
        list = "";
        list = "";
        if(userTickets.length != 0 || userTickets === undefined){
            let i = 0;
            userTickets[numberOfTicketInList].itemlist.forEach(el => {
                list += `${++i}) ${el.name} - ${el.price} grn (${el.amount} шт)\n`;
            })
            let courier = "";
            if(userTickets[numberOfTicketInList].courier != ""){
                let cour_arr = userTickets[numberOfTicketInList].courier.split('(');
                let final_res = cour_arr[1].split(')')
                courier = final_res[0];
            }else{
                courier = "В очікуванні на кур'єра ⌛"
            }
            await ctx.reply(`Дата замовлення: ${userTickets[numberOfTicketInList].date}\n\nСписок замовлених товарів:\n\n${list}\n\nКур'єр: ${courier}\n\nЗагальна ціна: ${userTickets[numberOfTicketInList].tPrice} грн💸\n\nСтатус замовлення: ${userTickets[numberOfTicketInList].status === 0 ? 'Складаємо замовлення ⌛' : userTickets[numberOfTicketInList].status === 1 ? 'Курєр забрав замовлення 🚗' : 'Доставлено ✅'}`,
                {
                    reply_markup: {
                        inline_keyboard: numberOfTicketInList != 0 ? [
                            [
                                {text: "◀️", callback_data: "previous"},
                                {text: "▶️", callback_data: "next"}
                            ],
                            [
                                {text: 'Залишити відгук', callback_data: `send_comment_${userTickets[numberOfTicketInList]._id}`}
                            ]
                        ] : [
                            [
                                {text: "▶️", callback_data: "next"}
                            ],
                            [
                                {text: 'Залишити відгук', callback_data: `send_comment_${userTickets[numberOfTicketInList]._id}`}
                            ]
                        ],
                        resize_keyboard: true
                    }
                }
            );
        }
    });

    bot.hears(cmdList.buttons.map(button => button.name), async ctx => {
        let controller;
        let data;
        try {
            switch (ctx.update.message.text) {
                case 'Ресторани 🍽️':
                    await ctx.reply( 'Обери заклад харчування у якому ти хочеш замовити. Список закладів у тебе відображаються під даним повідомленням', getRestsKeyboard())
                    break;
                case 'Магазини 🏪':
                    await ctx.reply( 'Обери магазин у якому ти хочеш замовити. Список магазинів у тебе відображаються під даним повідомленням', getShopsKeyboard())
                    break;
                case 'Кошик 🧺':
                    controller = new User();
                    data = await controller.getByUsername(ctx.chat.id);
                    if(data.busket.length != 0){
                        await ctx.reply( 'Твій кошик виглядає ось так:')
                        let list = "";
                        let i = 0;
                        data.busket.forEach(el => {
                            list += `${++i}) ${el.name} - ${el.price} грн 💸 (${el.amount} шт)\n`;
                        })
                        await ctx.reply( `${list}`)
                        await ctx.reply( 'Обери дію через яку ти будеш взаємодіяти із власним кошиком', {reply_markup:busket_menu_btn})
                    }else{
                        await ctx.reply( '❗️В твоїй корзині лежить щось з "Аврора Маркет" тому ти не можеш добавити товар з іншого закладу.\nПочисть корзину, або заверши оформлення покупки в «Аврора маркет»\nХочу повідомити, один заклад - одна доставка. Поки що ми не беремо замовлення з декількох закладів.', {reply_markup:menu_btn})
                    }
                    break;
                case 'Очистити 🗑️':
                    controller = new User();
                    await controller.updateUser(ctx.chat.id, {busket: []});
                    await ctx.reply('Кошик став порожнім😢', {reply_markup:menu_btn});
                    break;
                case 'Головна 🚪':
                    await ctx.reply('Обери пункт у меню який тобі до вподоби, щоби продовжити користування системою😌', {reply_markup: menu_btn});
                    break;
                case "Вказати адресу 🔄":
                    try {
                        await ctx.reply( 'Перед тим як я оформлю твоє замовлення вкажи свою адресу куди саме потрібно все доставити за прикладом - вул. Симоненка буд 2 кв 41 😉')
                        await getAdress(bot);
                    } catch (error) {
                        console.log(`Error while edit address. Error: ${error}`);
                    }
                    break;
                case "Оформити замовлення 📝":
                    controller = new User();
                    let user_info = await controller.getByUsername(ctx.chat.id);
                    if(user_info.busket.length === 0){
                        await ctx.reply( 'Спочатку склади все в кошик або відправ фото\скрін списку продуктів, які потрібно привезти😌', {reply_markup:menu_btn})
                    }else if(user_info.adress === ""){
                        await ctx.reply( 'Перед тим як я оформлю твоє замовлення вкажи свою адресу куди саме потрібно все доставити за прикладом - вул. Симоненка буд 2 кв 41 😉')
                        await getAdress(bot);
                    }else if(user_info.pnumber === ""){
                        await ctx.scene.enter('setNumber');
                    }else if(user_info.client_name === ""){
                        await ctx.scene.enter('setName');
                    }else if(user_info.payMethod === ""){
                        await ctx.scene.enter('setpaymethod');
                    }else{
                        let itemList = "";
                        let i = 0;
                        user_info.busket.forEach(el => {
                            itemList += `${++i}) ${el.name} - ${el.price} grn (${el.amount} шт)\n`;
                        })
                        if(itemList != ""){
                            await ctx.reply( 'Оформляю твоє замовлення')
                            await ctx.reply( 'Твої персональні дані:')
                            await ctx.reply(`Власник: ${user_info.client_name}\nАдреса доставки: ${user_info.adress}`)
                            await ctx.reply( 'Твій кошик виглядає ось так:')
                            await ctx.reply( `${itemList}`)
                            await ctx.reply( `До сплати: ${countSum(user_info.busket)} грн💸`)
                            await ctx.reply( 'Якщо все вірно, натисни "Продовжити ▶️" і замовлення буде оформлено😉\nУ разі якщо адресу вказав неправильно - натисни "Змінити адресу 🔄" аби змінити адресу доставки😌', {
                                reply_markup: {
                                    inline_keyboard:[
                                        [
                                            {text: "Змінити адресу 🔄", callback_data: "reinit_adress"},
                                        ],
                                        [
                                            
                                            {text: "Продовжити ▶️", callback_data: "finish_order"}
                                        ],
                                    ]
                                }
                            })
                        }else{
                            await ctx.reply( '❗️В твоїй корзині лежить щось з "Аврора Маркет" тому ти не можеш добавити товар з іншого закладу.\nПочисть корзину, або заверши оформлення покупки в «Аврора маркет»\nХочу повідомити, один заклад - одна доставка. Поки що ми не беремо замовлення з декількох закладів.', {reply_markup:menu_btn})
                        }
                    }
                    break;
                case 'Історія покупок 📒':
                    let tickets = new Ticket();
                    let Users = new User();
                    let user = await Users.getByUsername(ctx.chat.id);
                    userTickets = await tickets.getByUsername(`${user.client_name}%20-%20${ctx.chat.id}`);
                    list = "";
                    if(userTickets.length != 0 || userTickets === undefined){
                        let i = 0;
                        userTickets[numberOfTicketInList].itemlist.forEach(el => {
                            list += `${++i}) ${el.name} - ${el.price} grn (${el.amount} шт)\n`;
                        })
                        let courier = "";
                        if(userTickets[numberOfTicketInList].courier != ""){
                            let cour_arr = userTickets[numberOfTicketInList].courier.split('(');
                            let final_res = cour_arr[1].split(')')
                            courier = final_res[0];
                        }else{
                            courier = "В очікуванні на кур'єра ⌛"
                        }
                        await ctx.reply(`Дата замовлення: ${userTickets[numberOfTicketInList].date}\n\nСписок замовлених товарів:\n\n${list}\n\nКур'єр: ${courier}\n\nЗагальна ціна: ${userTickets[numberOfTicketInList].tPrice} грн💸\n\nСтатус замовлення: ${userTickets[numberOfTicketInList].status === 0 ? 'Складаємо замовлення ⌛' : userTickets[numberOfTicketInList].status === 1 ? 'Курєр забрав замовлення 🚗' : 'Доставлено ✅'}`,
                            {
                                reply_markup: {
                                    inline_keyboard: numberOfTicketInList != 0 ? [
                                        [
                                            {text: "◀️", callback_data: "previous"},
                                            {text: "▶️", callback_data: "next"}
                                        ],
                                        [
                                            {text: 'Залишити відгук', callback_data: `send_comment_${userTickets[numberOfTicketInList]._id}`}
                                        ]
                                    ] : [
                                        [
                                            {text: "▶️", callback_data: "next"}
                                        ],
                                        [
                                            {text: 'Залишити відгук', callback_data: `send_comment_${userTickets[numberOfTicketInList]._id}`}
                                        ]
                                    ],
                                    resize_keyboard: true
                                }
                            }
                        );
                    }else{
                        await ctx.reply(`Ти ще нічого не замовляв😕`);
                    }
                    break;
                case "Замовити з фото кошика 🧺":
                    await ctx.scene.enter('sendBusketPhoto');
                    break;
                default:
                    console.log(ctx);
                    break;
            }
        } catch (error) {
            console.log(`Error info: ${error}`);
        }
    });
}

module.exports = readCommandsButton;