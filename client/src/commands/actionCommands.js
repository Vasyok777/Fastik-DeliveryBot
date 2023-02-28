const Telegraf = require('telegraf');
require('dotenv').config();
const {menu_btn} = require('../models/buttons');
const shopList = require('../models/shops');
const restList = require('../models/rest');
const {User, Ticket} = require('../api/controller/index');
const {getAdress} = require('./inputCommands');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const doc = new GoogleSpreadsheet(process.env.GS_SpreadSheetID);

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

function readCommandsAction(bot){

    bot.action('cont_reg', async (ctx) => {
        let Users = new User();
        let user = await Users.getByUsername(ctx.chat.username);
        if(user === undefined){
            await Auth.register(ctx.chat.username)
        }
        if(user.pnumber === ""){
            await ctx.reply('Бачу, щось пішло не так коли ти вводив свій номер телефону😕\nЩо ж давай це виправимо😉');
            await ctx.scene.enter('setNumber');
        }else if(user.client_name === ""){
            await ctx.scene.enter('setName');
        }else{
            await ctx.reply('Дякую за роботу, все що потрібно було мені - отримано, ти молодець😉\nОбери пункт у меню який тобі до вподоби, щоби продовжити користування системою😌', {reply_markup: menu_btn});
        }
    })

    bot.action('previous', async (ctx) => {
        await ctx.deleteMessage();
        if(numberOfTicketInList+1 < 1){
            numberOfTicketInList = 0;
        }else{
            --numberOfTicketInList;
        }
        list = "";
        let tickets = new Ticket();
        userTickets = await tickets.getByUsername(`@${ctx.chat.username}%20(${ctx.chat.first_name}%20${ctx.chat.last_name != undefined ? ctx.chat.last_name : '\b'})`);
        if(userTickets.length != 0){
            let i = 0;
            userTickets[numberOfTicketInList].itemlist.forEach(el => {
                list += `${++i}) ${el.name} - ${el.price} grn (${el.amount} шт)\n`;
            })
            await ctx.reply(`Індекс замовлення: ${userTickets[numberOfTicketInList]._id}\n\nДата замовлення: ${userTickets[numberOfTicketInList].date}\n\nСписок замовлених товарів:\n\n${list}\n\nКур'єр: @${userTickets[numberOfTicketInList].courier != "" ? '@'+userTickets[numberOfTicketInList].courier : "В очікуванні на кур'єра ⌛"}\n\nЗагальна ціна: ${userTickets[numberOfTicketInList].tPrice} грн💸\n\nСтатус замовлення: ${userTickets[numberOfTicketInList].status === 0 ? 'Очікує підтвердження ⌛' : userTickets[numberOfTicketInList].status === 1 ? 'Очікує доставлення🚗' : 'Доставлено✅'}`,
                {
                    reply_markup: {
                        inline_keyboard: numberOfTicketInList != 0 ? [
                            [
                                {text: "◀️", callback_data: "previous"},
                                {text: "▶️", callback_data: "next"}
                            ]
                        ] : [
                            [
                                {text: "▶️", callback_data: "next"}
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
        if(userTickets.length <= numberOfTicketInList+1){
            numberOfTicketInList = userTickets.length - 1;
        }else ++numberOfTicketInList;
        list = "";
        let tickets = new Ticket();
        userTickets = await tickets.getByUsername(`@${ctx.chat.username}%20(${ctx.chat.first_name}%20${ctx.chat.last_name != undefined ? ctx.chat.last_name : '\b'})`);
        if(userTickets.length != 0){
            let i = 0;
            userTickets[numberOfTicketInList].itemlist.forEach(el => {
                list += `${++i}) ${el.name} - ${el.price} grn (${el.amount} шт)\n`;
            })
            await ctx.reply(`Індекс замовлення: ${userTickets[numberOfTicketInList]._id}\n\nДата замовлення: ${userTickets[numberOfTicketInList].date}\n\nСписок замовлених товарів:\n\n${list}\n\nКур'єр: ${userTickets[numberOfTicketInList].courier != "" ? '@'+userTickets[numberOfTicketInList].courier : "В очікуванні на кур'єра ⌛"}\n\nЗагальна ціна: ${userTickets[numberOfTicketInList].tPrice} грн💸\n\nСтатус замовлення: ${userTickets[numberOfTicketInList].status === 0 ? 'Очікує підтвердження ⌛' : userTickets[numberOfTicketInList].status === 1 ? 'Очікує доставлення🚗' : 'Доставлено✅'}`,
                {
                    reply_markup: {
                        inline_keyboard: numberOfTicketInList != 0 ? [
                            [
                                {text: "◀️", callback_data: "previous"},
                                {text: "▶️", callback_data: "next"}
                            ]
                        ] : [
                            [
                                {text: "▶️", callback_data: "next"}
                            ]
                        ],
                        resize_keyboard: true
                    }
                }
            );
        }
    });
    bot.action('main', async (ctx) => {
        await ctx.reply('Обери пункт у меню який тобі до вподоби, щоби продовжити користування системою😌', {reply_markup: menu_btn});
    });

    bot.action('reinit_adress', async (ctx) => {
        await ctx.deleteMessage();
        await ctx.reply( 'Перед тим як я оформлю твоє замовлення вкажи свою адресу куди саме потрібно все доставити за прикладом - вул. Симоненка буд 2 кв 41\nУ разі якщо хочеш скасувати внесення адреси - натисни "Скасувати ❌" і тоді повернешся до головного меню😉', {reply_markup:{
            keyboard: [
                ['Скасувати ❌']
            ],
            resize_keyboard: true,
        }})
        await getAdress(bot);
    });

    bot.action('finish_order', async (ctx) => {
        await ctx.deleteMessage();
        try {

            let Tickets = new Ticket();
            let Users = new User();
            user = await Users.getByUsername(ctx.chat.username)
            if(user.pnumber === ""){
                await ctx.scene.enter('setNumber');
            }else if(user.client_name === ""){
                await ctx.scene.enter('setName');
            }else if(user.payMethod === ""){
                await ctx.scene.enter('setpaymethod');
            }else{
                await doc.useServiceAccountAuth({
                    client_email: process.env.GS_client_email,
                    private_key: process.env.GS_private_key.split(String.raw`\n`).join('\n'),
                });
                let string_busket = ""
                let i = 0;
                user.busket.forEach(item => {
                    string_busket += `${++i}) ${item.name} - ${item.price} грн/о.т (${item.amount}шт).\n`
                })
                let date = new Date();
                let result = await Tickets.addTicket({
                    itemlist: user.busket,
                    owner: user.client_name,
                    adress: user.adress,
                    pnumber: user.pnumber,
                    tPrice: countSum(user.busket),
                    from: user.busket[0].from,
                    payMethod: user.payMethod,
                    date: `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()-1}:${date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()}:${date.getSeconds()}`,
                });
                let tickets = await Tickets.getAllByStatus(0);
                let ticket;
                tickets.forEach(row => {
                    let compInfo = String(row.date);
                    if(compInfo === result.date && row.owner === result.owner){
                        ticket = row;
                    }
                });
                const raw = {
                    'Унікальний номер чеку': ticket._id,
                    'Покупець': ticket.owner,
                    'Кошик': string_busket,
                    'Заклад': ticket.from,
                    'Адреса доставки': ticket.adress,
                    'Номер телефону клієнта': ticket.pnumber,
                    'Сумма': ticket.tPrice,
                    'Спосіб оплати': ticket.payMethod,
                    'Дата замовлення': ticket.date,
                    'Кур\'єр': ticket.courier,
                    'Статус': 'В обробці',
                };
                await doc.loadInfo();
                const sheet = doc.sheetsById[434269134];
                await sheet.addRow(raw);
                
                await Users.updateUser(ctx.chat.username, {busket: [], adress: "", payMethod: ""})
                await ctx.reply('Замовлення успішно оформленно✅\nЩоб переглянути замовлення натисни - "Історія покупок 📒" і дізнайся деталі кожного твого замовлення😌', {reply_markup: menu_btn});    
            }
        } catch (error) {
            console.log('====================================');
            console.log(`Error while finishing order. ${error}`);
            console.log('====================================');
        }
    })

    bot.action(/add_(.+)_(.+)_(.+)/, async (ctx) => {
        const [list, shop_id, item_id] = ctx.match.slice(1);
        await ctx.deleteMessage();
        const controller = new User();
        const data = await controller.getByUsername(ctx.chat.username);
        let basket = data.busket;
        if(list === "shop"){
            const shop = shopList.find(shops => shops.id === Number(shop_id));
            const item = shop.products.find(products => products.id === Number(item_id))
            if(basket.length != 0){
                if(basket[0].from != shop.name){
                    await ctx.reply(`Ти можеш замовляти товари виключно в '${basket[0].from}'`, {reply_markup: menu_btn});
                }else{
                    basket.push(
                        {
                            "name": item.name,
                            "price": item.price,
                            "amount": 0,
                            "from": shop.name
                        }
                    );
                    await controller.updateUser(ctx.chat.username, {busket: basket});
                    await ctx.scene.enter('initBasket');
                }
            }else{
                basket.push(
                    {
                        "name": item.name,
                        "price": item.price,
                        "amount": 0,
                        "from": shop.name
                    }
                );
                await controller.updateUser(ctx.chat.username, {busket: basket});
                await ctx.scene.enter('initBasket');
            }
            
        }else if (list === "rest"){
            const shop = restList.find(shops => shops.id === Number(shop_id));
            const item = shop.products.find(products => products.id === Number(item_id))
            if(basket.length != 0){
                if(basket[0].from != shop.name){
                    await ctx.reply(`Ти можеш замовляти товари виключно в '${basket[0].from}'`, {reply_markup: menu_btn});
                }else{
                    basket.push(
                        {
                            "name": item.name,
                            "price": item.price,
                            "amount": 0,
                            "from": shop.name
                        }
                    );
                    await controller.updateUser(ctx.chat.username, {busket: basket});
                    await ctx.scene.enter('initBasket');
                }
            }else{
                basket.push(
                    {
                        "name": item.name,
                        "price": item.price,
                        "amount": 0,
                        "from": shop.name
                    }
                );
                await controller.updateUser(ctx.chat.username, {busket: basket});
                await ctx.scene.enter('initBasket');
            }
            
        }
    })
    
    bot.action(/get_list_(.+)_(.+)/, async (ctx) => {
        await ctx.deleteMessage();
        const [list, shop_id, item_id] = ctx.match.slice(1);
        if(list === "shop"){
            const shop = shopList.find(shops => shops.id === Number(shop_id));
            ctx.session.shop = shop;
            ctx.reply(`Обери товари з даного списку що знаходиться під даним повідомленням😌`, getProductsKeyboard(shop, "shop"));
        }else if (list === "rest"){
            const shop = restList.find(shops => shops.id === Number(shop_id));
            ctx.session.shop = shop;
            ctx.reply(`Обери товари з даного списку що знаходиться під даним повідомленням😌`, getProductsKeyboard(shop, "rest"));
        }
    })

    bot.action(/get_(.+)_(.+)_(.+)/, async (ctx) => {
        const [list, shop_id, item_id] = await ctx.match.slice(1);
        console.log(`get_${list}_${shop_id}_${item_id}`);
        await ctx.deleteMessage();
        if(list === "shop"){
            const shop = await shopList.find(shops => shops.id === Number(shop_id));
            const item = await shop.products.find(products => products.id === Number(item_id))
            await ctx.sendPhoto(
                {
                    source: item.photo
                },
                {
                    caption:  `${item.name}\nЦіна:${item.price} грн`,
                    reply_markup: {
                        inline_keyboard:[
                            [
                                {text: "У кошик 🗑️", callback_data: `add_${list}_${shop_id}_${item_id}`}
                            ],
                            [
                                {text: "Інші товари 📝", callback_data: `get_list_${list}_${shop_id}`}
                            ]
                        ]
                    }
                }
            );
        }else if (list === "rest"){
            const shop = await restList.find(shops => shops.id === Number(shop_id));
            const item = await shop.products.find(products => products.id === Number(item_id))
            await ctx.sendPhoto(
                {
                    source: `${item.photo}`
                },
                {
                    caption:  `${item.name}\nЦіна:${item.price}грн`,
                    reply_markup: {
                        inline_keyboard:[
                            [
                                {text: "У кошик 🗑️", callback_data: `add_${list}_${shop_id}_${item_id}`}
                            ],
                            [
                                {text: "Інші товари 📝", callback_data: `get_list_${list}_${shop_id}`}
                            ]
                        ]
                    }
                }
            );
        }
    })
}

module.exports = readCommandsAction;