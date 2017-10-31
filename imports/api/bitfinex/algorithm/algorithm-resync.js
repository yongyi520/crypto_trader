// next steps in algorithm
import { martingaleNextStep } from '/imports/api/algorithms/martingale/bitfinex/martingale-bitfinex.js';
import { dailyNextStep } from '/imports/api/algorithms/daily/bitfinex/daily-bitfinex.js';

// api
import { getMyOrderStatus } from '/imports/api/bitfinex/rest.js';

// collections
import { Algorithms } from '/imports/api/algorithms/algorithms.js';
import { AlgorithmRuns } from '/imports/api/algorithm-runs/algorithm-runs.js';

// collection updater
import { updateCancelOrder } from '/imports/api/orders/orders-update.js';
import { insertUpdateLogNoFiber, insertErrorLogFiber } from '/imports/api/system-logs/systemLogs-update.js';

// collection searcher
import { activeOrdersWithOrderIdNoFiber } from '/imports/api/orders/orders-search.js';

// parser
import { convertApiParsedOrderToWssParsedOrder } from '/imports/api/bitfinex/lib/parseResponse/wss/wssResponseParser';
import { parseApiOrder } from '/imports/api/bitfinex/lib/parseResponse/api/apiResponseParser.js';


import Future from 'fibers/future';

export const resyncBitfinexAlgorithms = function(){
    resyncBitfinexManager();
}.future()

const resyncBitfinexManager = function(){
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

                        // choose which next step to take for algorithm run
                        if(algorithm.name == 'martingale'){
                            martingaleNextStep(parsedWssStatus, algorithm.type);
                        } else if (algorithm.name == 'daily'){
                            dailyNextStep(parsedOrderStatus, algorithm.type);
                        }
                    } else if (parsedWssStatus.status == 'CANCELED'){
                        // update canceled order
                        insertUpdateLogNoFiber(algorithmRun.algorithm_id, 'bitfinex', algorithmRun.symbol,
                            orderStatusApiResponse.side + " order ( " + parsedOrderStatus.original_amount + " @ $" + parsedOrderStatus.average_executed_price + " ) Canceled");
                        updateCancelOrder(parsedWssStatus.order_id);

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