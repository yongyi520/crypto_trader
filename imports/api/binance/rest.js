import Binance from 'node-binance-api';

Binance.options({
    'APIKEY': Meteor.settings.binance.key,
    'APISECRET': Meteor.settings.binance.secret,
    // 'test': Meteor.settings.development
})

// api
export const binanceGetPrice = Binance.prices;

export const binanceCurrentBalance = Binance.balance;

export const binanceLimitBuyOrder = Binance.buy;

export const binanceLimitSellOrder = Binance.sell;

export const binanceMarketBuyOrder = Binance.marketBuy;

export const binanceMarketSellOrder = Binance.marketSell;

export const binanceCancelOrder = Binance.cancel;

export const binanceOrderStatus = Binance.orderStatus;

export const binanceTradeHistory = Binance.trades;

// websockets
export const binanceWebsocketsCandlesticks = Binance.websockets.candlesticks;

export const binanceWebsocketsUserData = Binance.websockets.userData;
