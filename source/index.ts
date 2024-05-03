import {Client} from "leonetti-axios-kucoin";
console.log("hello ts");
console.log(Client);
import { sleep } from "@leonetti/utils";
import schedule from "node-schedule";

const k1 = new Client({
	secret: process.env.KUCOIN_SECRET as string,
	password: process.env.PASS_PHRASE as string,
	key: process.env.KUCOIN_KEY as string,
});

async function entry(
	symbolTicker: string,
	size: number,
	stopLoss: number,
	limitLoss: number,
	lowBound: number
) {
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

		await sleep(1000);

		const sl1 = await k1.stopOrder.placeNewOrder({
			clientOid: Date.now().toString(),
			side: "sell",
			symbol:symbolTicker,
			stop: "loss",
			stopPrice: stop_price,
			price: lim_price,
			size: size_stop,
			tradeType: "MARGIN_ISOLATED_TRADE",
		});
	} else {
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

let interval = schedule.scheduleJob(m5, function () {
	entry("TON-USDT", 2.3, 0.03, 0.04, 5);
});
