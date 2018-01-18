// api
import { getWalletBalances, getOrderBook,
    getMyOrderStatus, newOrder, cancelOrder} from '/imports/api/bitfinex/rest.js';

// parser
import { convertApiParsedOrderToWssParsedOrder } from '/imports/api/bitfinex/lib/parseResponse/wss/wssResponseParser';
import { parseApiOrder, parseApiWallet } from '/imports/api/bitfinex/lib/parseResponse/api/apiResponseParser.js';

// collections
import { Algorithms } from '/imports/api/algorithms/algorithms.js';
import { AlgorithmRuns } from '/imports/api/algorithm-runs/algorithm-runs.js';
import { AlgorithmSettings } from '/imports/api/algorithm-settings/algorithm-settings.js';

// collection updater
import { addTotalAmountAndPriceToAlgorithmRunNoFiber, addExecutedAmountAndPriceToAlgorithmRunNoFiber, updateCompleteAlgorithmRunNoFiber} from '/imports/api/algorithm-runs/algorithmRuns-update.js';
import { updateCancelOrder, updateExecutedOrderNoFiber } from '/imports/api/orders/orders-update.js';
import { insertUpdateLogNoFiber, insertErrorLogFiber } from '/imports/api/system-logs/systemLogs-update.js';

// collection searcher
import { findActiveAlgorithmRunWithOrderIdNoFiber } from '/imports/api/algorithm-runs/algorithmRuns-search.js';
import { activeOrdersWithOrderIdNoFiber } from '/imports/api/orders/orders-search.js';

// algorithm libs
import { saveOrderAndInitNewAlgorithmRun, saveOrderAndAddOrderIdToAlgorithmRun, updatePartialOrderThenCancelOrder } from '/imports/api/algorithms/lib/bitfinex/bitfinex-algorithm-helpers.js';
import { hasEnoughNextOrderMarginBalance, getMarginCurrencyBalanceFromWallets } from '/imports/api/algorithms/lib/bitfinex/bitfinex-wallet-helpers.js';

// libs
import Future from 'fibers/future';

export const resyncManualBitfinex = function(){

}

export const startNewManualBitfinex = function(entryOrderParam, profitOrderParam, stopLossOrderParam){

}

const initialOrderFunction = function(){

}

export const manualNextStep = function(){

}

const manualUpdateOrder = function(){

}

const manualCreateNextOrder = function(){

}

const executeManualNextOrders = function(){

}

const manualNextOrders = function(){

}
