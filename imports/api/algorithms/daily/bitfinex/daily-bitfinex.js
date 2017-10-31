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
import { updateCancelAlgorithmRuns, insertAlgorithmRun,
    addTotalAmountAndPriceToAlgorithmRunNoFiber, addExecutedAmountAndPriceToAlgorithmRunNoFiber,
    addOrderIdToAlgorithmRunNoFiber, updateCompleteAlgorithmRunNoFiber} from '/imports/api/algorithm-runs/algorithmRuns-update.js';
import { updateCancelOrder, updateExecutedOrderNoFiber, insertOrder } from '/imports/api/orders/orders-update.js';
import { insertUpdateLogNoFiber, insertErrorLogFiber } from '/imports/api/system-logs/systemLogs-update.js';

// collection searcher
import { findActiveAlgorithmRunWithOrderIdNoFiber, findActiveAlgorithmRunNoFiber } from '/imports/api/algorithm-runs/algorithmRuns-search.js';
import { activeOrdersWithOrderIdNoFiber } from '/imports/api/orders/orders-search.js';

// algorithm libs
import { saveOrderAndInitNewAlgorithmRun, saveOrderAndAddOrderIdToAlgorithmRun, updatePartialOrderThenCancelOrder } from '/imports/api/algorithms/lib/bitfinex/bitfinex-algorithm-helpers.js';
import { getExchangeCurrencyBalanceFromWallets, hasEnoughExchangeBalance } from '/imports/api/algorithms/lib/bitfinex/bitfinex-wallet-helpers.js';

// price-tracker
import { getBitfinexDailyData } from '/imports/api/price-tracker/getCryptoPriceData.js';

// libs
import Future from 'fibers/future';

export const resyncDailyBitfinex = function(){
    console.log("resyncing to Bitfinex algorithm run");

    // find active algorithm run
    var martingaleAlgorithms = Algorithms.find({name: "daily"}).fetch();
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
            insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', algorithmRun.symbol, "Resyncing with daily bitfinex " + algorithmRun.symbol)
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
                        dailyNextStep(parsedWssStatus, algorithm.type);
                    } else if (parsedWssStatus.status == 'CANCELED'){
                        // update canceled order
                        insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', algorithmRun.symbol,
                            orderStatusApiResponse.side + " order ( " + parsedOrderStatus.original_amount + " @ $" + parsedOrderStatus.average_executed_price + " ) Canceled");
                        updateCancelOrder(parsedWssStatus.order_id);

                        // // testing
                        // insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', algorithmRun.symbol,
                        //     orderStatusApiResponse.side + " order ( " + parsedOrderStatus.original_amount + " @ $" + parsedOrderStatus.average_executed_price + " ) Executed. Continue next step");
                        // dailyNextStep(parsedWssStatus, algorithm.type);
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
}.future()

export const syncedCrontStartNewDailyBitfinex = function(){
    updatePartialThenNextStepDailyBitfinex();
    startAllNewActiveDailyAlgorithmRun();
}

export const startAllNewActiveDailyAlgorithmRun = function(){
    // find active algorithm run
    var martingaleAlgorithms = Algorithms.find({name: "daily"}).fetch();
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
            var algorithm = Algorithms.findOne(algorithmRun.algorithm_id);
            startNewDailyBitfinex(algorithmRun.symbol, algorithm.type);
        });
    }
}.future()

// 1. get active algorithm run
// 2. get order status of the order id
// 3. if partially filled, update the corresponding algorithm run
export const updatePartialThenNextStepDailyBitfinex = function(){
    console.log("resyncing to Bitfinex algorithm run for daily partially fulfilled orders");

    // find active algorithm run
    var martingaleAlgorithms = Algorithms.find({name: "daily"}).fetch();
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
            insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', algorithmRun.symbol, "Updating Partial with daily bitfinex " + algorithmRun.symbol)
            var activeOrders = activeOrdersWithOrderIdNoFiber(algorithmRun.order_ids);
            activeOrders.forEach( order => {
                // add a delay in there with each order so the server can finish api calls in orderly fashion

                var updateOrderStatusFunction = orderStatusApiResponse => {
                    var parsedOrderStatus = parseApiOrder(orderStatusApiResponse);
                    var parsedWssStatus = convertApiParsedOrderToWssParsedOrder(parsedOrderStatus);
                    console.log("parsed order status", parsedOrderStatus);
                    console.log("converted to wss", parsedWssStatus);
                    if (parsedOrderStatus.status == 'EXECUTED' || parsedOrderStatus.remaining_amount < parsedOrderStatus.original_amount){
                        // convert api order detail to parsedWssOrderDetail
                        insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', algorithmRun.symbol,
                            orderStatusApiResponse.side + " order ( " + parsedOrderStatus.executed_amount + " @ $" + parsedOrderStatus.average_executed_price + " ) Executed (or Partially Executed). Continue next step");
                        dailyNextStep(parsedWssStatus, algorithm.type);
                    } else if (parsedWssStatus.status == 'CANCELED'){
                        // update canceled order
                        insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', algorithmRun.symbol,
                            orderStatusApiResponse.side + " order ( " + parsedOrderStatus.original_amount + " @ $" + parsedOrderStatus.average_executed_price + " ) Canceled");
                        updateCancelOrder(parsedWssStatus.order_id);

                        // // testing
                        // insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', algorithmRun.symbol,
                        //     orderStatusApiResponse.side + " order ( " + parsedOrderStatus.original_amount + " @ $" + parsedOrderStatus.average_executed_price + " ) Executed. Continue next step");
                        // dailyNextStep(parsedWssStatus, algorithm.type);
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
}.future()



export const startNewDailyBitfinex = function(symbol, type){
    var dailyFindCriteria = {
        name: "daily",
        type: type.toUpperCase()
    }
    var algorithm = Algorithms.findOne(dailyFindCriteria);
    var algorithmSetting = AlgorithmSettings.findOne({exchange: "bitfinex", algorithm_id: algorithm._id, symbol: symbol});

    // if the algorithm setting for is on, then go ahead and start it or else don't start it
    if(algorithmSetting){
        if(algorithmSetting.is_active){
            insertUpdateLogNoFiber(algorithm._id, 'bitfinex', symbol, "Daily " + type + " Run started for bitfinex " + symbol)

            var errorHandlingFunction = (apiErrorMessage) => {
                insertErrorLogFiber(algorithm._id, "bitfinex", symbol, "Start New Daily Bitfinex function error: " + JSON.stringify(apiErrorMessage))
                if(apiErrorMessage.message.includes('Nonce is too small') || _.isEmpty(apiErrorMessage)){
                    setTimeout( () => getBitfinexDailyData(symbol).then( (dailyData) => initialOrderFunction(dailyData, symbol, algorithm._id) )
                        .then( (orderApiResponse) => saveOrderAndInitNewAlgorithmRun(orderApiResponse, algorithm._id) )
                        .catch(errorHandlingFunction), 1000)
                }
            }

            getBitfinexDailyData(symbol).then( (dailyData) => initialOrderFunction(dailyData, algorithm, algorithmSetting) )
                .then( (orderApiResponse) => saveOrderAndInitNewAlgorithmRun(orderApiResponse, algorithm._id) )
                .catch( errorHandlingFunction);
        } else {
            console.log("bitfinex daily SHBL ", symbol, " is not active, No sell function initiated")
            insertErrorLogFiber(algorithm._id, "bitfinex", symbol, "initial sell function error: Algorithm is not active")
        }

    } else {
        console.log("there's no algorithm setting for bitfinex daily algorithm");
        insertErrorLogFiber(algorithm._id, "bitfinex", symbol, "initial sell function error: No Algorithm Setting present")
    }
}

const initialOrderFunction = function(dailyData, algorithm, algorithmSetting){

    var initialOrderParams = null;
    var initialPrice = null;
    var initialAmount = null;
    var side = null;
    var yesterdayData = null;

    if(dailyData.data.Response == 'Success') {
        console.log("success response");

        console.log("algorithm setting", algorithmSetting);
        console.log("algorithm", algorithm);

        yesterdayData = dailyData.data.Data[0];

        console.log("yesterday data", yesterdayData);

        if(algorithm.type == 'BLSH'){
            // choose low if it's a rising bar
            // choose close if it's a descending bar
            initialPrice = yesterdayData.close < yesterdayData.open ?
                yesterdayData.close * algorithmSetting.next_step_percentage :
                yesterdayData.low * algorithmSetting.next_step_percentage;
            initialAmount = algorithmSetting.start_amount / initialPrice;
            side = 'buy';
        } else if (algorithm.type == 'SHBL') {
            // choose high if it's a descending bar
            // choose close if it's a rising bar
            initialPrice = yesterdayData.close > yesterdayData.open ?
                yesterdayData.close * algorithmSetting.next_step_percentage :
                yesterdayData.high * algorithmSetting.next_step_percentage;
            initialAmount = algorithmSetting.start_amount / initialPrice;
            side = 'sell';
        }

        initialOrderParams = {
            symbol: algorithmSetting.symbol,
            amount: initialAmount.toString(),
            price: initialPrice.toString(),
            side: side,
            type: "exchange limit",
            exchange: "bitfinex"
        }

        console.log("initial order param", initialOrderParams);
        insertUpdateLogNoFiber(algorithmSetting.algorithm_id, 'bitfinex', algorithmSetting.symbol, "Creating initial " + side + " Order  " + initialAmount.toString() + " @ $" + initialPrice.toString());
        return newOrder(initialOrderParams)
    } else {
        insertErrorLogFiber(algorithmSetting.algorithm_id, 'bitfinex', algorithmSetting.symbol, "Error obtaining yesterday's daily data for Daily Algorithm");
        console.log("Error obtaining yesterday's daily data for Daily Algorithm");
    }


}

export const dailyNextStep = function(parsedWssExecutedOrderDetail, dailyType){
    // update orders, 5 second delay in case if order is filled immediately. Giving time for api response for orders to be saved in the database
    setTimeout( () => dailyRunUpdateOrders(parsedWssExecutedOrderDetail), 10000);

    // check if remaining amount in algorithmRun is 0
    // if 0, then init new
    // if not, continue to next step
    setTimeout( () => dailyRunNextStep(parsedWssExecutedOrderDetail, dailyType), 20000);
}.future()

const dailyRunUpdateOrders = function(parsedWssExecutedOrderDetail){
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
                    // - amount for accounting partial executed order
                    addTotalAmountAndPriceToAlgorithmRunNoFiber(algorithmRun._id, parsedWssExecutedOrderDetail.original_amount - parsedWssExecutedOrderDetail.amount, parsedWssExecutedOrderDetail.average_price);
                    // addTotalAmountAndPriceToAlgorithmRunNoFiber(algorithmRun._id, parsedWssExecutedOrderDetail.original_amount, parsedWssExecutedOrderDetail.original_price)
                } else if (parsedWssExecutedOrderDetail.original_amount > 0){
                    addExecutedAmountAndPriceToAlgorithmRunNoFiber(algorithmRun._id, parsedWssExecutedOrderDetail.original_amount - parsedWssExecutedOrderDetail.amount, parsedWssExecutedOrderDetail.average_price)
                    // addExecutedAmountAndPriceToAlgorithmRunNoFiber(algorithmRun._id, parsedWssExecutedOrderDetail.original_amount, parsedWssExecutedOrderDetail.original_price);
                }
            } else if (algorithm.type == "BLSH"){
                if(parsedWssExecutedOrderDetail.original_amount < 0){
                    addExecutedAmountAndPriceToAlgorithmRunNoFiber(algorithmRun._id, parsedWssExecutedOrderDetail.original_amount - parsedWssExecutedOrderDetail.amount, parsedWssExecutedOrderDetail.average_price);
                    // addExecutedAmountAndPriceToAlgorithmRunNoFiber(algorithmRun._id, parsedWssExecutedOrderDetail.original_amount, parsedWssExecutedOrderDetail.original_price);
                } else if (parsedWssExecutedOrderDetail.original_amount > 0){
                    addTotalAmountAndPriceToAlgorithmRunNoFiber(algorithmRun._id, parsedWssExecutedOrderDetail.original_amount - parsedWssExecutedOrderDetail.amount, parsedWssExecutedOrderDetail.average_price)
                    // addTotalAmountAndPriceToAlgorithmRunNoFiber(algorithmRun._id, parsedWssExecutedOrderDetail.original_amount, parsedWssExecutedOrderDetail.original_price)
                }
            }

        }
    })
}.future()

const dailyRunNextStep = function(parsedWssExecutedOrderDetail, dailyType){
    var symbol = parsedWssExecutedOrderDetail.symbol;
    var algorithmRun = findActiveAlgorithmRunWithOrderIdNoFiber(parsedWssExecutedOrderDetail.order_id);
    var algorithmSetting = AlgorithmSettings.findOne({symbol: symbol, exchange: "bitfinex", algorithm_id: algorithmRun.algorithm_id});

    if(algorithmSetting){
        var total = algorithmRun.amount_total * algorithmRun.average_total_price;
        var executed_price = parsedWssExecutedOrderDetail.average_price != 0 ? parsedWssExecutedOrderDetail.average_price : parsedWssExecutedOrderDetail.original_price;
        var reset_price = executed_price * algorithmSetting.reset_percentage;
        var reset_side = dailyType == 'BLSH' ? 'sell' : 'buy';

        var profit_percentage = (algorithmSetting.reset_percentage - 1) * algorithmSetting.profit_split_percentage + 1;
        var reset_amount = profit_percentage / algorithmSetting.reset_percentage * algorithmRun.amount_remaining;

        var reset_order_params = {
            symbol: symbol,
            amount: reset_amount.toString(),
            price: reset_price.toString(),
            side: reset_side,
            type: "exchange limit",
            exchange: "bitfinex"
        }
        console.log("profit percentage", profit_percentage);
        console.log("reset percentage", algorithmSetting.reset_percentage);
        console.log("reset_order_params", reset_order_params);

        insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', parsedWssExecutedOrderDetail.symbol,
            "Creating Daily Reset Step Orders. " + reset_side + " Order: " + reset_order_params.amount + "@ $" + reset_order_params.price);
        executeResetDailyOrders(reset_order_params, algorithmRun, algorithmSetting);

    }

}.future()


const executeResetDailyOrders = function(resetOrderParams, algorithmRun){
    var nextStepOrdersFunction = (walletApiResponse) =>{

        var parsedApiWallets = parseApiWallet(walletApiResponse);

        var resetCurrency = resetOrderParams.side == 'sell' ? resetOrderParams.symbol.slice(0, 3) : resetOrderParams.symbol.slice(3, 6);
        var resetCurrencyBalance = getExchangeCurrencyBalanceFromWallets(parsedApiWallets, resetCurrency);

        if(hasEnoughExchangeBalance(resetCurrencyBalance, resetOrderParams)){
            var resetOrderErrorHandlingFunction = (apiErrorMessage) => {
                insertErrorLogFiber(algorithmRun.algorithm_id, "bitfinex", resetOrderParams.symbol, "bitfinex next step " + resetOrderParams.side + " order error: " + JSON.stringify(apiErrorMessage))
                if(apiErrorMessage.message.includes('Nonce is too small') || _.isEmpty(apiErrorMessage)){
                    setTimeout(() => newOrder(resetOrderParams).then( (orderAPIResponse) => saveOrderAndAddOrderIdToAlgorithmRun(orderAPIResponse, algorithmRun))
                        .catch( resetOrderErrorHandlingFunction ), 1000)
                }
            }

            insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', resetOrderParams.symbol,
                "Creating " + resetOrderParams.side + " Back Order: " + resetOrderParams.amount + "@ $" + resetOrderParams.price);

            newOrder(resetOrderParams).then( (orderAPIResponse) => saveOrderAndAddOrderIdToAlgorithmRun(orderAPIResponse, algorithmRun))
                .catch( resetOrderErrorHandlingFunction );
        }


        console.log("parsed api wallet", parsedApiWallets);
        console.log("has enough next order balance", hasEnoughExchangeBalance(resetCurrencyBalance, resetOrderParams));
        console.log("reset order currency", resetCurrency);
    }

    var getBalanceErrorHandlingFunction = (apiErrorMessage) => {
        insertErrorLogFiber(algorithmRun.algorithm_id, "bitfinex", resetOrderParams.symbol, "Martingale next step getBalance error: " + JSON.stringify(apiErrorMessage))

        if(apiErrorMessage.message.includes('Nonce is too small') || _.isEmpty(apiErrorMessage || apiErrorMessage)){
            setTimeout(() => getWalletBalances().then( nextStepOrdersFunction ).catch( getBalanceErrorHandlingFunction ), 2000);
        }
    }

    setTimeout(() => getWalletBalances().then( nextStepOrdersFunction ).catch( getBalanceErrorHandlingFunction ), 2000);
}