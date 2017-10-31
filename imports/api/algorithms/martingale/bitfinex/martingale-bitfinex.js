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

export const resyncMartingaleBitfinex = function(){
    console.log("resyncing to Bitfinex algorithm run");

    // find active algorithm run
    var martingaleAlgorithms = Algorithms.find({name: "martingale"}).fetch();
    var algorithmIds = [];
    martingaleAlgorithms.forEach( algorithm => {
        algorithmIds.push(algorithm._id)
    })
    // find active algorithm run
    var activeAlgorithmRuns =  AlgorithmRuns.find({status: 'ACTIVE',
        exchange: 'bitfinex',
        algorithm_id: {$in: algorithmIds}}).fetch();
    // find the active orders within algorithm run
    if(activeAlgorithmRuns){
        activeAlgorithmRuns.forEach( algorithmRun => {
            console.log("algorithm run: ", algorithmRun);
            var algorithm = Algorithms.findOne(algorithmRun.algorithm_id);
            insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', algorithmRun.symbol, "Resyncing with margingale bitfinex " + algorithmRun.symbol)
            var activeOrders = activeOrdersWithOrderIdNoFiber(algorithmRun.order_ids);
            activeOrders.forEach( order => {
                // add a delay in there with each order so the server can finish api calls in orderly fashion

                var updateOrderStatusFunction = orderStatusApiResponse => {
                    var parsedOrderStatus = parseApiOrder(orderStatusApiResponse);
                    var parsedWssStatus = convertApiParsedOrderToWssParsedOrder(parsedOrderStatus);
                    console.log("parsed order status", parsedOrderStatus);
                    console.log("converted to wss", parsedWssStatus);
                    if (parsedOrderStatus.status == 'EXECUTED' || parsedOrderStatus.remaining_amount <= 0.0001){
                        // convert api order detail to parsedWssOrderDetail
                        insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', algorithmRun.symbol,
                            orderStatusApiResponse.side + " order ( " + parsedOrderStatus.original_amount + " @ $" + parsedOrderStatus.average_executed_price + " ) Executed. Continue next step");
                        martingaleNextStep(parsedWssStatus, algorithm.type);
                    } else if (parsedWssStatus.status == 'CANCELED'){
                        // update canceled order
                        insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', algorithmRun.symbol,
                            orderStatusApiResponse.side + " order ( " + parsedOrderStatus.original_amount + " @ $" + parsedOrderStatus.average_executed_price + " ) Canceled");
                        updateCancelOrder(parsedWssStatus.order_id);

                        // for testing!
                        // if(parsedWssStatus.original_amount > 0){ // change it to if(parsedWssStatus.amount > 0)
                        //     martingaleNextStep(parsedWssStatus);
                        // }
                        // if(parsedWssStatus.original_amount < 0) { // change it to if(parsedWssStatus.amount < 0) {
                        //     martingaleNextStep(parsedWssStatus);
                        // }
                    } else {
                        console.log("nothing has happened to order", parsedOrderStatus.symbol, " ", parsedOrderStatus.original_amount, "@ $", parsedOrderStatus.price);
                        insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', algorithmRun.symbol,
                            "nothing has happened to " + parsedOrderStatus.symbol + " " + parsedOrderStatus.side + " order ( " + parsedOrderStatus.original_amount + "@ $" + parsedOrderStatus.price + " )");
                    }
                };

                var handleErrorFunction = apiErrorResponse => {
                    if(apiErrorResponse.message.includes('Nonce is too small') || _.isEmpty(apiErrorResponse)){
                        console.log("nounce too small, get order status, retry");
                        insertErrorLogFiber(algorithmRun.algorithm_id, 'bitfinex', algorithmRun.symbol, "resync get order status error: " + JSON.stringify(apiErrorResponse));
                        setTimeout(() => getMyOrderStatus({order_id: order.order_id}).then( updateOrderStatusFunction ).catch( handleErrorFunction ), 1000);
                    }
                }

                getMyOrderStatus({order_id: order.order_id}).then( updateOrderStatusFunction ).catch( handleErrorFunction )
            })
        })
    }
    // find the active orders and check on the status
    // if cancelled call
    // updateCancelOrder
    // if executed call
    // convert api order detail to parsedWssOrderDetail
    // martingaleNextStep(parsedWssOrderDetail);

}.future()

export const startNewMartingaleBitfinex = function(symbol, martingaleType){
    var params = {limit_bids: 5, limit_asks: 5};
    var martingaleFindCritera = {
        name: "bitfinex",
        type: martingaleType.toUpperCase()
    }
    var algorithm = Algorithms.findOne(martingaleFindCritera);
    var algorithmSetting = AlgorithmSettings.findOne({exchange: "bitfinex", algorithm_id: algorithm._id, symbol: symbol});

    // if the algorithm setting for bitfinex SHBL is on, then go ahead and start it or else don't start it
    if(algorithmSetting){
        if(algorithmSetting.is_active){
            insertUpdateLogNoFiber(algorithm._id, 'bitfinex', symbol, "Martingale Run SHBL started for bitfinex " + symbol)

            var errorHandlingFunction = (apiErrorMessage) => {
                insertErrorLogFiber(algorithm._id, "bitfinex", symbol, "initial sell function error: " + JSON.stringify(apiErrorMessage))
                if(apiErrorMessage.message.includes('Nonce is too small') || _.isEmpty(apiErrorMessage)){
                    setTimeout( () => getOrderBook(symbol, params).then( (orderBook) => initialOrderFunction(orderBook, symbol, algorithm._id) )
                        .then( (orderApiResponse) => saveOrderAndInitNewAlgorithmRun(orderApiResponse, algorithm._id) )
                        .catch(errorHandlingFunction), 1000)
                }
            }

            getOrderBook(symbol, params).then( (orderBook) => initialOrderFunction(orderBook, symbol, algorithm._id) )
                .then( (orderApiResponse) => saveOrderAndInitNewAlgorithmRun(orderApiResponse, algorithm._id) )
                .catch( errorHandlingFunction);
        } else {
            console.log("bitfinex bitfinex SHBL ", symbol, " is not active, No sell function initiated")
        }

    } else {
        console.log("there's no algorithm setting for bitfinex omgusd bitfinex shbl");
    }


}

// functions for initial sell orders

const initialOrderFunction = function(orderBook, symbol, algorithmId){
    var martingaleFindCriteria = {
        _id: algorithmId
    }
    var algorithm = Algorithms.findOne(martingaleFindCriteria);
    var algorithmSetting = AlgorithmSettings.findOne({symbol: symbol, exchange: "bitfinex", algorithm_id: algorithmId});
    var initialPrice = null;
    var side = null;
    var amount = null;
    if(algorithm.type == "SHBL"){
        initialPrice = parseFloat(orderBook.bids[0].price) * 0.995;
        side = "sell";
        amount = algorithmSetting.start_amount - (Math.random() * algorithmSetting.start_amount * 0.04);
    } else if (algorithm.type == "BLSH"){
        initialPrice = parseFloat(orderBook.asks[0].price) * 1.005;
        side = "buy";
        amount = algorithmSetting.start_amount - (Math.random() * algorithmSetting.start_amount * 0.04);
    }

    var initialOrderParams = {
        symbol: symbol,
        amount: amount.toString(),
        price: initialPrice.toString(),
        side: side,
        type: "limit",
        exchange: "bitfinex"
    }
    // console.log("buy orders", buyOrders);
    // console.log("highest bid", highestBid);
    // console.log("lowest limit sell price", lowestLimitSellPrice);
    // console.log("symbol", symbol);
    console.log("params", initialOrderParams);

    insertUpdateLogNoFiber(algorithmId, 'bitfinex', symbol, "Creating initial " + side + " Order  " + algorithmSetting.start_amount.toString() + " @ $" + initialPrice.toString());
    return newOrder(initialOrderParams)
}




// functions for wss listener function

export const martingaleNextStep = function(parsedWssExecutedOrderDetail, martingaleType){

    // update orders, 5 second delay in case if order is filled immediately. Giving time for api response for orders to be saved in the database
    setTimeout( () => martingaleRunUpdateOrders(parsedWssExecutedOrderDetail), 10000);

    // check if remaining amount in algorithmRun is 0
    // if 0, then init new
    // if not, continue to next step
    setTimeout( () => margingaleRunCompleteAndInitNewOrNextStep(parsedWssExecutedOrderDetail, martingaleType), 20000);

}.future()

/**
 *  1. Find Active Orders within algorithm run
 *  2. update orders
 *      if order is the same as executed order
 *          update it to executed
 *          if executed order is a sell order
 *              add the sell amount to algorithm run
 *      if order is not the same as executed order
 *          update it to be canceled
 * @param parsedWssExecutedOrderDetail
 */

const martingaleRunUpdateOrders = function(parsedWssExecutedOrderDetail){

    // find the algorithmRun this order belongs to
    var algorithmRun = findActiveAlgorithmRunWithOrderIdNoFiber(parsedWssExecutedOrderDetail.order_id);
    var algorithm = Algorithms.findOne({_id: algorithmRun.algorithm_id});
    // get all orders that are active in this algorithm run
    var activeOrders = activeOrdersWithOrderIdNoFiber(algorithmRun.order_ids);
    console.log("algorithm run in updating orders", algorithmRun);
    console.log("active orders within algorithm run", activeOrders);
    _.forEach(activeOrders, (order) => {
        if(order.order_id == parsedWssExecutedOrderDetail.order_id){
            console.log("updating order id to be executed: ", order.order_id);
            console.log("parsed wss executed order detail", parsedWssExecutedOrderDetail);
            updateExecutedOrderNoFiber(order.order_id);

            insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', parsedWssExecutedOrderDetail.symbol,
                order.side + " Order (" + parsedWssExecutedOrderDetail.original_amount + " @" + parsedWssExecutedOrderDetail.average_price + ") Executed");

            // if bitfinex SHBL, sell order = total amount, buy order = executed amount
            // if bitfinex BLSH, sell order = executed amount, buy order = total amount
            if(algorithm.type == "SHBL"){
                if(parsedWssExecutedOrderDetail.original_amount < 0){
                    addTotalAmountAndPriceToAlgorithmRunNoFiber(algorithmRun._id, parsedWssExecutedOrderDetail.original_amount, parsedWssExecutedOrderDetail.average_price);
                } else if (parsedWssExecutedOrderDetail.original_amount > 0){
                    addExecutedAmountAndPriceToAlgorithmRunNoFiber(algorithmRun._id, parsedWssExecutedOrderDetail.original_amount, parsedWssExecutedOrderDetail.average_price)
                }
            } else if (algorithm.type == "BLSH"){
                if(parsedWssExecutedOrderDetail.original_amount < 0){
                    addExecutedAmountAndPriceToAlgorithmRunNoFiber(algorithmRun._id, parsedWssExecutedOrderDetail.original_amount, parsedWssExecutedOrderDetail.average_price);
                } else if (parsedWssExecutedOrderDetail.original_amount > 0){
                    addTotalAmountAndPriceToAlgorithmRunNoFiber(algorithmRun._id, parsedWssExecutedOrderDetail.original_amount, parsedWssExecutedOrderDetail.average_price)
                }
            }

        } else {
            console.log("cancelling order id", order.order_id)
            insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', parsedWssExecutedOrderDetail.symbol,
                "Check if order: (" + order.original_amount + " @ $ " + order.price + ") is partially filled then cancel");
            var errorHandlingFunction = (apiErrorMessage) => {
                insertErrorLogFiber(algorithmRun.algorithm_id, "bitfinex", algorithmRun.symbol, "Get order status error: " + JSON.stringify(apiErrorMessage))
                if(apiErrorMessage.message.includes('Nonce is too small') || apiErrorMessage){
                    setTimeout(() => getMyOrderStatus({order_id: order.order_id}).then( (myOrderStatusApiResponse) => updatePartialOrderThenCancelOrder(myOrderStatusApiResponse, algorithmRun) )
                        .catch( errorHandlingFunction ), 1000);
                }
            }
            getMyOrderStatus({order_id: order.order_id}).then( (myOrderStatusApiResponse) => updatePartialOrderThenCancelOrder(myOrderStatusApiResponse, algorithmRun) )
                .catch( errorHandlingFunction);
        }
    })

}.future()

const margingaleRunCompleteAndInitNewOrNextStep = function(parsedWssExecutedOrderDetail, martingaleType){
    var algorithmRun = findActiveAlgorithmRunWithOrderIdNoFiber(parsedWssExecutedOrderDetail.order_id);
    var algorithm = Algorithms.findOne({_id: algorithmRun.algorithm_id})
    if(algorithmRun){
        if(algorithmRun.amount_remaining == 0 || algorithmRun.amount_remaining <= 0.00001){
            insertUpdateLogNoFiber(algorithmRun.algorithm_id, algorithmRun.exchange, algorithmRun.symbol, "remaining amount is 0 in algorithm run. Start restart algorithm run");
            updateCompleteAlgorithmRunNoFiber(algorithmRun._id);
            startNewMartingale(algorithmRun.symbol, algorithm.type);
        } else {
            // continue with bitfinex next step
            insertUpdateLogNoFiber(algorithmRun.algorithm_id, algorithmRun.exchange, algorithmRun.symbol, "remaining amount is NOT 0 in algorithm run. Continue to next step in algorithm run");
            martingaleRunCreateNextOrders(parsedWssExecutedOrderDetail, martingaleType);
        }

    }
}.future()

/**
 * Create orders for next step of margingale process
 * 1. if executed order is a buy order
 *          - update algorithmRun as complete
 *          - (buy order automatically updated from (algorithmRunUpdateOrders)
 *      else if executed order is a sell order
 *          - create next sell order with (1 + step_size) * last sell price and 2x last sell amount
 *          - create next buy order with buy_back * average sold price of amount sold
 * @param executedOrderDetail
 */
export const martingaleRunCreateNextOrders = function(parsedWssExecutedOrderDetail, martingaleType){
    // create new orders
    // set a new sell order with double the amount

    // set a buy order to buy back the total amount sold

    console.log("bitfinex run creating next orders");
    var symbol = parsedWssExecutedOrderDetail.symbol;
    var algorithmRun = findActiveAlgorithmRunWithOrderIdNoFiber(parsedWssExecutedOrderDetail.order_id);
    var algorithmSetting = AlgorithmSettings.findOne({symbol: symbol, exchange: "bitfinex", algorithm_id: algorithmRun.algorithm_id});
    console.log("algorithm settings finding criteria", {symbol: symbol, exchange: "bitfinex", algorithm_id: algorithmRun.algorithm_id});
    console.log("algorithm run", algorithmRun);
    console.log("algorithmSetting", algorithmSetting);
    if(algorithmSetting){

        // generic bitfinex
        var next_step_amount = algorithmRun.amount_remaining * 2;
        var current_step_price = parsedWssExecutedOrderDetail.average_price != 0 ? parsedWssExecutedOrderDetail.average_price : parsedWssExecutedOrderDetail.original_price;
        var next_step_price_orig = current_step_price * (algorithmSetting.next_step_percentage);
        var next_step_price = (next_step_price_orig).toString();
        var next_order_params = {
            symbol: symbol,
            amount: next_step_amount.toString(),
            price: next_step_price,
            side: martingaleType == 'SHBL' ? "sell" : "buy",
            type: "limit",
            exchange: "bitfinex"
        }

        var total = algorithmRun.average_total_price * algorithmRun.amount_total;
        var executed = algorithmRun.average_executed_price * algorithmRun.amount_executed;

        var reset_price_orig = ( total * algorithmSetting.reset_percentage - executed) / algorithmRun.amount_remaining;
        var reset_price = (reset_price_orig).toString();
        var reset_amount = algorithmRun.amount_remaining;
        var reset_order_params = {
            symbol: symbol,
            amount: reset_amount.toString(),
            price: reset_price,
            side: martingaleType == 'SHBL' ? "buy" : "sell",
            type: "limit",
            exchange: "bitfinex"
        }

        console.log("next order params", next_order_params);
        console.log("reset order params", reset_order_params);

        insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', parsedWssExecutedOrderDetail.symbol,
            "Creating Martingale Next Step Orders. " + (parsedWssExecutedOrderDetail.original_amount < 0 ? "Sell" : "Buy") +
                " Order: " + next_order_params.amount + "@ $" + next_order_params.price + ". " + (parsedWssExecutedOrderDetail.original_amount < 0 ? "Buy" : "Sell") +
                " Order: " + reset_order_params.amount + "@ $" + reset_order_params.price);
        executeNextMargingaleOrders(next_order_params, reset_order_params, algorithmRun, algorithmSetting);

    }

}.future()

const executeNextMargingaleOrders = function(nextOrderParams, resetOrderParams, algorithmRun, algorithmSetting){
    if (nextOrderParams.type == 'limit'){
        marginNextMartingaleOrder(nextOrderParams, resetOrderParams, algorithmRun, algorithmSetting);
    }

}

const marginNextMartingaleOrder = function(nextOrderParams, resetOrderParams, algorithmRun, algorithmSetting){
    var nextStepOrdersFunction = (walletApiResponse) =>{

        var parsedApiWallets = parseApiWallet(walletApiResponse);

        var nextOrderCurrency = nextOrderParams.symbol.slice(0, 3);
        var resetOrderCurrency = resetOrderParams.symbol.slice(3, 6);

        var sellCurrencyBalance = getMarginCurrencyBalanceFromWallets(parsedApiWallets, nextOrderCurrency);

        // // if wallet has enough eth balance
        if(hasEnoughNextOrderMarginBalance(sellCurrencyBalance, nextOrderParams, algorithmRun, algorithmSetting)){
            insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', nextOrderParams.symbol,
                "Has Enough Balance for " + nextOrderParams.side + " Order: " + nextOrderParams.amount + "@ $" + nextOrderParams.price);
            insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', nextOrderParams.symbol,
                "Creating " + nextOrderParams.side + " Order: " + nextOrderParams.amount + "@ $" + nextOrderParams.price);

            var resetOrderErrorHandlingFunction = (apiErrorMessage) => {
                insertErrorLogFiber(algorithmRun.algorithm_id, "bitfinex", resetOrderParams.symbol, "bitfinex next step " + resetOrderParams.side + " order error: " + JSON.stringify(apiErrorMessage))
                if(apiErrorMessage.message.includes('Nonce is too small') || _.isEmpty(apiErrorMessage)){
                    setTimeout(() => newOrder(resetOrderParams).then( (orderAPIResponse) => saveOrderAndAddOrderIdToAlgorithmRun(orderAPIResponse, algorithmRun))
                        .catch( resetOrderErrorHandlingFunction ), 1000)
                }
            }

            insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', resetOrderParams.symbol,
                "Creating " + resetOrderParams.side + " Back Order: " + resetOrderParams.amount + "@ $" + resetOrderParams.price);

            setTimeout( () => newOrder(resetOrderParams).then( (orderAPIResponse) => saveOrderAndAddOrderIdToAlgorithmRun(orderAPIResponse, algorithmRun))
                .catch( resetOrderErrorHandlingFunction ), 5000 );
        } else {
            insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', nextOrderParams.symbol,
                "Not Enough Balance for " + nextOrderParams.side + " Order: " + nextOrderParams.amount + "@ $" + nextOrderParams.price);
        }

        console.log("parsed api wallet", parsedApiWallets);
        console.log("next order currency", nextOrderCurrency);
        console.log("reset order wallet", sellCurrencyBalance);
        console.log("has enough next order balance", hasEnoughNextOrderMarginBalance(sellCurrencyBalance, nextOrderParams, algorithmRun, algorithmSetting));
        console.log("reset order currency", resetOrderCurrency);
    }

    var getBalanceErrorHandlingFunction = (apiErrorMessage) => {
        insertErrorLogFiber(algorithmRun.algorithm_id, "bitfinex", nextOrderParams.symbol, "Martingale next step getBalance error: " + JSON.stringify(apiErrorMessage))

        if(apiErrorMessage.message.includes('Nonce is too small') || _.isEmpty(apiErrorMessage || apiErrorMessage)){
            setTimeout(() => getWalletBalances().then( nextStepOrdersFunction ).catch( getBalanceErrorHandlingFunction ), 2000);
        }
    }

    setTimeout(() => getWalletBalances().then( nextStepOrdersFunction ).catch( getBalanceErrorHandlingFunction ), 2000);
}



