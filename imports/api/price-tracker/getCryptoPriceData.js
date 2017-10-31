import axios from 'axios';

import { exchanges, symbols, intervals } from '/imports/api/price-tracker/crypto-compare-constants.js';

export const getBitfinexHourlyData = function(symbol){
    var symbolParam = null;
    return getCryptoPrice(intervals.hour, exchanges.bitfinex, symbolParam);
}

export const getBitfinexDailyData = function(symbol){
    var symbolParam = null;
    console.log("symbol constant has symbol of ", symbol, _.has(symbols, symbol));
    if(_.has(symbols, symbol)){
        symbolParam = symbols[symbol];
        console.log("symbol param", symbolParam);
        return getCryptoPrice(intervals.day, exchanges.bitfinex, symbolParam);
    } else {
        return getCryptoPrice(intervals.day, exchanges.bitfinex, symbolParam);
    }

}

const getCryptoPrice = function(interval, exchange, symbol, aggregate=1, limit=1){
    var string = 'https://min-api.cryptocompare.com/data/' +
        interval + '?' +
        'fsym=' + symbol.from + '&' +
        'tsym=' + symbol.to + '&' +
        'e=' + exchange + '&' +
        'aggregate=' + aggregate.toString() + '&' +
        'limit=' + limit.toString();
    console.log("call crypto price string", string);
    return axios.get(string);
}
