import { startNewMartingaleBitfinex } from '/imports/api/algorithms/martingale/bitfinex/martingale-bitfinex.js';

import { startNewDailyBitfinex } from '/imports/api/algorithms/daily/bitfinex/daily-bitfinex.js';

// symbol: omgusd, ethusd, neobtc, neousd, omgbtc
// type: SHBL or BLSH
export const startMartingaleBitfinex = function(symbol, type){
    startNewMartingaleBitfinex(symbol, type);
}

// symbol: omgusd, ethusd, neobtc, neousd, omgbtc
// type: BLSH
export const startDailyBitfinex = function(symbol, type){
    startNewDailyBitfinex(symbol, type);
}