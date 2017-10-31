// collections
import { Algorithms } from '/imports/api/algorithms/algorithms.js';

// wss parser
import { parseWssOrder } from '/imports/api/bitfinex/lib/parseResponse/wss/wssResponseParser';

// collection search
import { findActiveAlgorithmRunWithOrderIdNoFiber} from '/imports/api/algorithm-runs/algorithmRuns-search.js';

// collection update
import { updateCancelOrder } from '/imports/api/orders/orders-update.js';

// wss listeners
import { martingaleNextStep } from '/imports/api/algorithms/martingale/bitfinex/martingale-bitfinex.js';
import { dailyNextStep } from '/imports/api/algorithms/daily/bitfinex/daily-bitfinex.js';


// libs
import Future from 'fibers/future';

export const wssOrderListenerFunction = function(data){
    if(data.length >= 3){
        if(data[1] == 'oc'){
            var parsedWssOrderDetail = parseWssOrder(data[2]);
            console.log("data detail", parsedWssOrderDetail);

            if (parsedWssOrderDetail.status.includes('EXECUTED') || Math.abs(parsedWssOrderDetail.amount) <= 0.0001){
                console.log("order executed");
                setTimeout(() => algorithmManager(parsedWssOrderDetail), 4000);
            } else if(parsedWssOrderDetail.status.includes('CANCELED')){
                console.log("order cancelled");
                setTimeout(() => algorithmManager(parsedWssOrderDetail), 4000);
                // update canceled order
                // updateCancelOrder(parsedWssOrderDetail.order_id);
            }
        }
    }
}

const algorithmManager = function(parsedWssOrderDetail){
    var algorithmRun = findActiveAlgorithmRunWithOrderIdNoFiber(parsedWssOrderDetail.order_id);
    var algorithm = Algorithms.findOne({_id: algorithmRun.algorithm_id});
    if (algorithm.name == 'bitfinex'){ // if order is part of bitfinex algorithm run
        martingaleNextStep(parsedWssOrderDetail, algorithm.type);
    } else if (algorithm.name == 'daily'){
        dailyNextStep(parsedWssOrderDetail, algorithm.type);
    }
}.future()