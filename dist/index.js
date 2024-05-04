"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const leonetti_axios_kucoin_1 = require("leonetti-axios-kucoin");
const utils_1 = require("@leonetti/utils");
const node_schedule_1 = __importDefault(require("node-schedule"));
const k1 = new leonetti_axios_kucoin_1.Client({
    secret: process.env.KUCOIN_SECRET,
    password: process.env.PASS_PHRASE,
    key: process.env.KUCOIN_KEY,
});
async function entry(symbolTicker, size, stopLoss, limitLoss, lowBound) {
    //let size = 1.5;
    let str_size = size.toFixed(3);
    let size_stop = (size * 0.995).toFixed(3);
    //let stopLoss = 0.005;
    //let limitLoss = 0.007;
    const prom_price = await k1.symbolsTicker.getTicker({ symbol: symbolTicker });
    const price = prom_price.data.data.price;
    const numberPrice = Number.parseFloat(price);
    if (numberPrice > lowBound) {
        const { data } = await k1.orders.placeMarginOrder({
            clientOid: Date.now().toString(),
            side: "buy",
            symbol: symbolTicker,
            type: "market",
            size: str_size,
            marginModel: "isolated",
        });
        const avgBuy = await k1.getAvg(data.data.orderId);
        console.log("avgBuy : ", avgBuy);
        // stop loss orders
        let stop_price = (avgBuy * (1 - stopLoss)).toFixed(3);
        let lim_price = (avgBuy * (1 - limitLoss)).toFixed(3);
        await (0, utils_1.sleep)(1000);
        const sl1 = await k1.stopOrder.placeNewOrder({
            clientOid: Date.now().toString(),
            side: "sell",
            symbol: symbolTicker,
            stop: "loss",
            stopPrice: stop_price,
            price: lim_price,
            size: size_stop,
            tradeType: "MARGIN_ISOLATED_TRADE",
        });
    }
    else {
        console.log("price too low");
        return "price too low";
    }
}
const m5 = "57 4,9,14,19,24,29,34,39,44,49,54,59 * * * *";
const m15 = "55 14,29,44,59 * * * *";
const h4 = "55 59 3,7,11,15,19,23 * * *";
const h8 = "50 59 7,15,23 * * *";
const h12 = "50 59 11,23 * * *";
const d1 = "47 59 23 * * *";
let interval = node_schedule_1.default.scheduleJob(h8, function () {
    entry("TON-USDT", 2.3, 0.03, 0.04, 5.2);
});
