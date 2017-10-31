// api
import { cancelOrder } from '/imports/api/bitfinex/rest.js';

// collections
import { Algorithms } from '/imports/api/algorithms/algorithms.js';
import { AlgorithmRuns } from '/imports/api/algorithm-runs/algorithm-runs.js';

// collection update
import { updateCancelAlgorithmRuns, insertAlgorithmRun, addApiOrderToAlgorithmRun,
        addTotalAmountAndPriceToAlgorithmRunNoFiber, addExecutedAmountAndPriceToAlgorithmRunNoFiber} from '/imports/api/algorithm-runs/algorithmRuns-update.js';
import { saveApiOrder, updateCancelOrder } from '/imports/api/orders/orders-update.js';
import { insertUpdateLogNoFiber, insertErrorLogFiber } from '/imports/api/system-logs/systemLogs-update.js';

// api parser
import { parseApiOrder } from '/imports/api/bitfinex/lib/parseResponse/api/apiResponseParser.js';

export const createNewAlgorithmRun = function(orderAPIResponse, algorithmId){
    var algorithmRunOrders = [];
    var algorithm = Algorithms.findOne({_id: algorithmId});
    if(algorithm){
        algorithmRunOrders.push(orderAPIResponse.id);
        var algorithmRunData = {
            algorithm_id: algorithmId,
            symbol: orderAPIResponse.symbol,
            exchange: orderAPIResponse.exchange,
            order_ids: algorithmRunOrders,
            amount_total: 0,
            amount_executed: 0,
            amount_remaining: 0,
            average_total_price: 0,
            average_executed_price: 0,
            average_remaining_price: 0,
            status: 'ACTIVE'
        }
        console.log("inserting new algorithm run data", algorithmRunData);
        var existingAlgorithmRuns = AlgorithmRuns.find({status: algorithmRunData.status,
            exchange: algorithmRunData.exchange,
            symbol: algorithmRunData.symbol,
            algorithm_id: algorithmId}).fetch();
        console.log("existing run", existingAlgorithmRuns);
        if(existingAlgorithmRuns){
            updateCancelAlgorithmRuns(existingAlgorithmRuns);
        }
        insertAlgorithmRun(algorithmRunData);

    } else {
        console.log("there's no such algorithm exist")
    }
}

export const saveOrderAndInitNewAlgorithmRun = function(orderAPIResponse, algorithmId){
    insertUpdateLogNoFiber(algorithmId, 'bitfinex', orderAPIResponse.symbol,
        "Initial " +  orderAPIResponse.side + " Order (" + orderAPIResponse.original_amount + " @ $" + orderAPIResponse.price + ") Created");
    saveApiOrder(orderAPIResponse);
    createNewAlgorithmRun(orderAPIResponse, algorithmId);
}

export const saveOrderAndAddOrderIdToAlgorithmRun = function(orderApiResponse, algorithmRun){
    console.log("save order and add order id to algorithm run response", orderApiResponse);
    insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', orderApiResponse.symbol,
        orderApiResponse.side + " Order (" + orderApiResponse.original_amount + " @ $" + orderApiResponse.price + ") Created");
    saveApiOrder(orderApiResponse);
    var parsedApiOrder = parseApiOrder(orderApiResponse);
    addApiOrderToAlgorithmRun(parsedApiOrder, algorithmRun);
}

export const updatePartialOrderThenCancelOrder = function(activeApiOrderStatusResponse, algorithmRun){
    var parsedApiOrder = parseApiOrder(activeApiOrderStatusResponse);
    var algorithm = Algorithms.findOne({_id: algorithmRun.algorithm_id})
    console.log("checking if order is partially executed")
    console.log("unparsed partial order", activeApiOrderStatusResponse);
    console.log("parsed partial order", parsedApiOrder);
    if(parsedApiOrder.executed_amount != 0){
        console.log("partially fulfilled order");
        insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', parsedApiOrder.symbol,
            parsedApiOrder.side + " Order (" + parsedApiOrder.original_amount + " @" + parsedApiOrder.price + ") partially filled amount of ( " + parsedApiOrder.executed_amount + " @ $" + parsedApiOrder.average_executed_price + ")");

        // if algorithm type is SHBL (sell high buy low) sell order is total amount, buy order is executed amount
        // if algorithm type is BLSH (sell high buy low) sell order is executed amount, buy order is total amount
        if (algorithm.type == "SHBL"){
            if(parsedApiOrder.side == 'sell'){
                addTotalAmountAndPriceToAlgorithmRunNoFiber(algorithmRun._id, parsedApiOrder.executed_amount, parsedApiOrder.average_executed_price);
            } else if (parsedApiOrder.side == 'buy'){
                addExecutedAmountAndPriceToAlgorithmRunNoFiber(algorithmRun._id, parsedApiOrder.executed_amount, parsedApiOrder.average_executed_price);
            }
        } else if (algorithm.type == "BLSH"){
            if(parsedApiOrder.side == 'sell'){
                addExecutedAmountAndPriceToAlgorithmRunNoFiber(algorithmRun._id, parsedApiOrder.executed_amount, parsedApiOrder.average_executed_price);
            } else if (parsedApiOrder.side == 'buy'){
                addTotalAmountAndPriceToAlgorithmRunNoFiber(algorithmRun._id, parsedApiOrder.executed_amount, parsedApiOrder.average_executed_price);
            }
        }
    } else {
        console.log("no partial fulfilled order");
        insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', parsedApiOrder.symbol,
            parsedApiOrder.side + " Order (" + parsedApiOrder.original_amount + " @" + parsedApiOrder.price + ") not partially filled");

    }
    console.log("cancelling order");
    insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', parsedApiOrder.symbol,
        "Cancelling " + parsedApiOrder.side + " Order (" + parsedApiOrder.original_amount + " @" + parsedApiOrder.price + ")");

    var errorHandlingFunction = (apiErrorMessage) => {
        insertErrorLogFiber(algorithmRun.algorithm_id, "bitfinex", algorithmRun.symbol, "Cancel Order Error" + JSON.stringify(apiErrorMessage))
        if (apiErrorMessage.message.includes('Order could not be cancelled')){
            updateCancelOrder(parsedApiOrder.order_id);
        } else if(apiErrorMessage.message.includes('Nonce is too small') || _.isEmpty(apiErrorMessage)){
            setTimeout(() => cancelOrder({order_id: parsedApiOrder.order_id}).then( (response) => insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', parsedApiOrder.symbol,
                parsedApiOrder.side + " Order (" + parsedApiOrder.original_amount + " @" + parsedApiOrder.price + ") Cancelled"))
                .catch( errorHandlingFunction ), 1000)

        }
    }

    cancelOrder({order_id: parsedApiOrder.order_id}).then( (response) => insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', parsedApiOrder.symbol,
        parsedApiOrder.side + " Order (" + parsedApiOrder.original_amount + " @" + parsedApiOrder.price + ") Cancelled"))
        .catch( errorHandlingFunction );

}